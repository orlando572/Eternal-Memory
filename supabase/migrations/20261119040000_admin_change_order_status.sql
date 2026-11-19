-- TSK-15: transiciones de estado de un pedido hechas por un administrador.
--
-- Amplía lo que cubre `advance_order_status` (paid -> processing -> shipped -> completed) con:
--   * cualquier estado -> canceled, con motivo obligatorio;
--   * processing <-> review_required, con motivo obligatorio.
-- `paid` nunca lo asigna esta función: solo el webhook de pago (`record_payment_event`).
-- Cada cambio guarda autor, fecha y motivo en `order_status_history`.
--
-- La lista de transiciones permitidas está duplicada en
-- `src/features/admin-orders/lib/orderTransitions.ts`; una prueba comprueba que coinciden.
--
-- Al cancelar un pedido pendiente de pago se libera su reserva y se vencen sus intentos de pago.
-- No se toca el inventario de pedidos ya pagados ni se registra ningún reembolso: ambos se
-- gestionan a mano, porque el pago llegado fuera de plazo (`review_required`) nunca descontó stock.

create function public.admin_change_order_status(
  p_order_id uuid, p_admin_id uuid, p_to_status text, p_reason text default null
) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  v_order public.orders%rowtype;
  v_reason text := nullif(btrim(p_reason), '');
  v_reason_required boolean;
  v_item record;
begin
  if not exists (select 1 from public.staff_roles where user_id = p_admin_id and role = 'admin') then
    raise exception 'Administrator role required';
  end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found';
  end if;

  select t.reason_required into v_reason_required
  from (values
    ('paid', 'processing', false),
    ('processing', 'shipped', false),
    ('shipped', 'completed', false),
    ('processing', 'review_required', true),
    ('review_required', 'processing', true),
    ('pending_payment', 'canceled', true),
    ('paid', 'canceled', true),
    ('processing', 'canceled', true),
    ('shipped', 'canceled', true),
    ('completed', 'canceled', true),
    ('review_required', 'canceled', true)
  ) as t(from_status, to_status, reason_required)
  where t.from_status = v_order.status and t.to_status = p_to_status;
  if not found then
    raise exception 'Invalid order status transition';
  end if;
  if v_reason_required and v_reason is null then
    raise exception 'Reason required';
  end if;
  if v_reason is not null and char_length(v_reason) > 500 then
    raise exception 'Reason too long';
  end if;

  if p_to_status = 'canceled' and v_order.status = 'pending_payment' then
    for v_item in select variant_id, quantity from public.order_items
        where order_id = v_order.id order by variant_id loop
      update public.product_variants
        set stock_reserved = stock_reserved - v_item.quantity
        where id = v_item.variant_id and stock_reserved >= v_item.quantity;
      if not found then
        raise exception 'Reserved stock is missing';
      end if;
    end loop;
    update public.payment_attempts set status = 'expired'
      where order_id = v_order.id and status = 'pending';
    update public.orders set status = 'canceled', payment_status = 'failed' where id = v_order.id;
  else
    update public.orders set status = p_to_status where id = v_order.id;
  end if;

  insert into public.order_status_history (order_id, from_status, to_status, actor_id, reason)
    values (v_order.id, v_order.status, p_to_status, p_admin_id, v_reason);
end;
$$;
revoke all on function public.admin_change_order_status(uuid,uuid,text,text)
  from public, anon, authenticated;
grant execute on function public.admin_change_order_status(uuid,uuid,text,text) to service_role;

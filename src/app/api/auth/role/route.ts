import { AccountAccessError, requireUser } from "@/features/auth/services/accessService";

const privateHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
};

export async function GET() {
  try {
    const { role } = await requireUser();
    return Response.json({ role }, { headers: privateHeaders });
  } catch (error) {
    const status = error instanceof AccountAccessError ? error.status : 503;
    const message = error instanceof AccountAccessError
      ? error.message
      : "No se pudieron verificar los permisos de la cuenta. Inténtalo de nuevo.";
    return Response.json({ error: message }, { status, headers: privateHeaders });
  }
}

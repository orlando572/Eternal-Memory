alter table public.profiles
  add column dni text check (dni is null or dni ~ '^[0-9]{8}$'),
  add column birth_date date,
  add column gender text check (
    gender is null or gender in ('female', 'male', 'non_binary', 'prefer_not_to_say')
  );

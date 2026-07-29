-- Florescer — schema inicial
-- Convenções: 1 (muito baixo/mal) a 5 (muito alto/bem) para humor e energia,
-- para permitir médias e gráficos de evolução nas Estatísticas sem mapear enum -> número no app.

create extension if not exists "pgcrypto";

create type recurrence_type as enum ('nenhuma', 'diaria', 'semanal', 'mensal');
create type priority_level as enum ('baixa', 'media', 'alta');

create function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- PROFILES
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  daily_goal_points integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

alter table profiles enable row level security;

create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

-- ============================================================
-- LIFE AREAS (Áreas da Vida)
-- Lookup global, não pertence a um usuário. Leitura pública, sem escrita via API.
-- ============================================================

create table life_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  icon text not null,
  sort_order smallint not null default 0
);

alter table life_areas enable row level security;

create policy "life_areas_select_all" on life_areas
  for select using (true);

insert into life_areas (slug, name, icon, sort_order) values
  ('saude', 'Saúde', 'leaf', 1),
  ('autocuidado', 'Autocuidado', 'heart', 2),
  ('espiritualidade', 'Espiritualidade', 'hand-heart', 3),
  ('estudos', 'Estudos', 'book-open', 4),
  ('casa', 'Casa', 'home', 5),
  ('familia', 'Família', 'users', 6),
  ('financas', 'Finanças', 'coins', 7),
  ('hobby', 'Hobby', 'palette', 8),
  ('movimento', 'Movimento', 'footprints', 9),
  ('bem_estar', 'Bem-estar', 'flower', 10),
  ('objetivos', 'Objetivos', 'target', 11);

-- ============================================================
-- ACTIVITIES (Cadastro de Atividade / "Minha Rotina")
-- Templates recorrentes. As instâncias do dia vivem em activity_logs.
-- ============================================================

create table activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  life_area_id uuid not null references life_areas(id),
  name text not null,
  description text,
  scheduled_time time,
  duration_minutes integer,
  priority priority_level not null default 'media',
  points integer not null default 5,
  recurrence recurrence_type not null default 'diaria',
  -- semanal: {"days_of_week":[0-6]} (0=domingo) · mensal: {"day_of_month":1-31}
  recurrence_config jsonb,
  is_required boolean not null default false,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint points_positive check (points > 0)
);

create index activities_user_id_idx on activities(user_id) where active;

create trigger activities_set_updated_at
  before update on activities
  for each row execute function set_updated_at();

alter table activities enable row level security;

create policy "activities_all_own" on activities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- ACTIVITY LOGS (Checklist "Hoje" + "Histórico")
-- Uma linha = uma instância de uma atividade num dia específico.
-- Nome/pontos/obrigatoriedade são copiados da atividade na criação da instância
-- para que o histórico não mude retroativamente se a atividade for editada depois.
-- ============================================================

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id uuid references activities(id) on delete set null,
  life_area_id uuid not null references life_areas(id),
  scheduled_date date not null,
  name text not null,
  points integer not null,
  is_required boolean not null default false,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, activity_id, scheduled_date)
);

create index activity_logs_user_date_idx on activity_logs(user_id, scheduled_date);

alter table activity_logs enable row level security;

create policy "activity_logs_all_own" on activity_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- DAY ENTRIES (Humor/Energia/Intenção do dia + fechamento do dia)
-- Uma linha por usuário por dia: cobre check-in inicial e encerramento.
-- ============================================================

create table day_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  mood_start smallint check (mood_start between 1 and 5),
  energy_start smallint check (energy_start between 1 and 5),
  intention text,
  gratitude text,
  reflection text,
  tomorrow_note text,
  mood_end smallint check (mood_end between 1 and 5),
  energy_end smallint check (energy_end between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create trigger day_entries_set_updated_at
  before update on day_entries
  for each row execute function set_updated_at();

alter table day_entries enable row level security;

create policy "day_entries_all_own" on day_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- ESTATÍSTICAS — views derivadas, sem duplicar dados
-- ============================================================

-- Pontuação por dia (para a barra de progresso e o gráfico de evolução)
create view daily_points as
select
  user_id,
  scheduled_date as entry_date,
  sum(points) filter (where completed) as points_earned,
  sum(points) as points_possible,
  count(*) filter (where completed) as activities_completed,
  count(*) as activities_total,
  bool_and(completed) filter (where is_required) as all_required_done
from activity_logs
group by user_id, scheduled_date;

-- Um dia "cresce" o Jardim da Constância se as atividades obrigatórias do dia
-- foram todas concluídas (ou não havia nenhuma) e houve alguma interação real
-- no dia (checklist ou check-in). Nunca reduz nada em dias ruins — só deixa de crescer.
-- ASSUMPÇÃO A VALIDAR COM A JOYCE antes de depender disso no produto.
create view garden_days as
select
  coalesce(dp.user_id, de.user_id) as user_id,
  coalesce(dp.entry_date, de.entry_date) as entry_date,
  coalesce(dp.all_required_done, true)
    and (coalesce(dp.activities_completed, 0) > 0 or de.id is not null) as grew
from daily_points dp
full outer join day_entries de
  on de.user_id = dp.user_id and de.entry_date = dp.entry_date;

-- Sequência atual de dias consecutivos com crescimento (streak), terminando hoje
create view current_streak as
with ordered as (
  select user_id, entry_date, grew,
    entry_date - (row_number() over (partition by user_id order by entry_date))::int as grp
  from garden_days
  where entry_date <= current_date
),
runs as (
  select user_id, grp, grew, count(*) as run_length, max(entry_date) as run_end
  from ordered
  where grew
  group by user_id, grp, grew
)
select user_id, run_length as streak_days
from runs
where run_end = current_date
   or run_end = current_date - 1; -- ainda conta o streak se hoje não tiver dado check-in

-- Progresso total do Jardim (nunca decresce)
create view garden_progress as
select
  user_id,
  count(*) filter (where grew) as total_growth_days,
  case
    when count(*) filter (where grew) >= 365 then 'jardim_completo'
    when count(*) filter (where grew) >= 180 then 'arvore'
    when count(*) filter (where grew) >= 90 then 'planta'
    when count(*) filter (where grew) >= 30 then 'muda'
    when count(*) filter (where grew) >= 7 then 'broto'
    else 'semente'
  end as stage
from garden_days
group by user_id;

-- Áreas da vida mais/menos cuidadas (por pontos conquistados)
create view life_area_engagement as
select
  al.user_id,
  la.id as life_area_id,
  la.name as life_area_name,
  sum(al.points) filter (where al.completed) as points_earned,
  count(*) filter (where al.completed) as activities_completed
from activity_logs al
join life_areas la on la.id = al.life_area_id
group by al.user_id, la.id, la.name;

-- Humor e energia médios por período (o app filtra por data no client/RPC)
create view mood_energy_daily as
select user_id, entry_date, mood_start, mood_end, energy_start, energy_end
from day_entries;

comment on view daily_points is 'Base da barra de progresso diária e do gráfico de evolução.';
comment on view garden_days is 'Regra de crescimento do Jardim da Constância — ver comentário acima, validar critério com produto.';
comment on view current_streak is 'Sequência de dias consecutivos com crescimento, para a tela de Estatísticas.';
comment on view garden_progress is 'Total acumulado (nunca regride) e estágio atual do Jardim da Constância.';
comment on view life_area_engagement is 'Suporta "áreas mais cuidadas" / "áreas menos cuidadas" nas Estatísticas.';

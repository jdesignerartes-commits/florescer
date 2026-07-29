-- Florescer — expansão: Versículos de Ouro, Minha Saúde, Meus Exercícios
-- Todas as tabelas de usuário seguem o mesmo padrão RLS de 0001
-- (auth.uid() = user_id). exercises é biblioteca global (como life_areas).

-- ============================================================
-- VERSÍCULOS DE OURO
-- ============================================================

create table golden_verses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  verse_text text not null,
  book text not null,
  chapter integer,
  verse_number text, -- texto pra permitir "16" ou "16-17"
  bible_version text,
  reflection text,
  is_favorite boolean not null default false,
  audio_url text,
  transcription_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index golden_verses_user_id_idx on golden_verses(user_id);

create trigger golden_verses_set_updated_at
  before update on golden_verses
  for each row execute function set_updated_at();

alter table golden_verses enable row level security;

create policy "golden_verses_all_own" on golden_verses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table verse_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger verse_collections_set_updated_at
  before update on verse_collections
  for each row execute function set_updated_at();

alter table verse_collections enable row level security;

create policy "verse_collections_all_own" on verse_collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table verse_collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references verse_collections(id) on delete cascade,
  verse_id uuid not null references golden_verses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (collection_id, verse_id)
);

alter table verse_collection_items enable row level security;

create policy "verse_collection_items_all_own" on verse_collection_items
  for all using (
    exists (select 1 from verse_collections c where c.id = collection_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from verse_collections c where c.id = collection_id and c.user_id = auth.uid())
  );

create table verse_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table verse_tags enable row level security;

create policy "verse_tags_all_own" on verse_tags
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table verse_tag_relations (
  id uuid primary key default gen_random_uuid(),
  verse_id uuid not null references golden_verses(id) on delete cascade,
  tag_id uuid not null references verse_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (verse_id, tag_id)
);

alter table verse_tag_relations enable row level security;

create policy "verse_tag_relations_all_own" on verse_tag_relations
  for all using (
    exists (select 1 from golden_verses v where v.id = verse_id and v.user_id = auth.uid())
  ) with check (
    exists (select 1 from golden_verses v where v.id = verse_id and v.user_id = auth.uid())
  );

-- ============================================================
-- MINHA SAÚDE
-- ============================================================

create type measurement_context_type as enum (
  'repouso', 'pos_atividade', 'pos_alimentacao', 'antes_dormir',
  'ao_acordar', 'mal_estar', 'outro'
);

create table health_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- 'pressao_arterial' por enquanto. Texto livre (não enum) de propósito,
  -- pra dar pra adicionar peso/glicemia/etc depois sem migration de enum.
  measurement_type text not null default 'pressao_arterial',
  measurement_date date not null default current_date,
  measurement_time time,
  systolic smallint check (systolic > 0),
  diastolic smallint check (diastolic > 0),
  heart_rate smallint check (heart_rate > 0),
  measurement_context measurement_context_type,
  arm_used text,
  body_position text,
  symptoms text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index health_measurements_user_date_idx on health_measurements(user_id, measurement_date);

create trigger health_measurements_set_updated_at
  before update on health_measurements
  for each row execute function set_updated_at();

alter table health_measurements enable row level security;

create policy "health_measurements_all_own" on health_measurements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- MEUS EXERCÍCIOS
-- ============================================================

create type exercise_difficulty as enum ('iniciante', 'intermediario', 'avancado');
create type side_mode_type as enum ('ambos', 'direito', 'esquerdo', 'nenhum');
create type score_mode_type as enum ('integral', 'proporcional');
create type session_status_type as enum ('em_andamento', 'concluido', 'abandonado');
create type perceived_effort_type as enum (
  'muito_leve', 'leve', 'moderado', 'intenso', 'muito_intenso'
);

-- Biblioteca global — leitura pública, sem dono, igual life_areas.
create table exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  muscle_group text,
  objective text,
  instructions text,
  breathing_instructions text,
  common_mistakes text,
  precautions text,
  difficulty exercise_difficulty not null default 'iniciante',
  equipment text,
  animation_url text,
  thumbnail_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger exercises_set_updated_at
  before update on exercises
  for each row execute function set_updated_at();

alter table exercises enable row level security;

create policy "exercises_select_all" on exercises
  for select using (true);

create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  scheduled_days smallint[] not null default '{}', -- 0=domingo … 6=sábado
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger workouts_set_updated_at
  before update on workouts
  for each row execute function set_updated_at();

alter table workouts enable row level security;

create policy "workouts_all_own" on workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  order_index smallint not null default 0,
  sets smallint,
  repetitions smallint,
  duration_seconds integer,
  rest_seconds integer,
  side_mode side_mode_type not null default 'nenhum',
  score integer not null default 10,
  score_mode score_mode_type not null default 'integral',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workout_exercises_workout_id_idx on workout_exercises(workout_id);

create trigger workout_exercises_set_updated_at
  before update on workout_exercises
  for each row execute function set_updated_at();

alter table workout_exercises enable row level security;

create policy "workout_exercises_all_own" on workout_exercises
  for all using (
    exists (select 1 from workouts w where w.id = workout_id and w.user_id = auth.uid())
  ) with check (
    exists (select 1 from workouts w where w.id = workout_id and w.user_id = auth.uid())
  );

create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid references workouts(id) on delete set null,
  session_date date not null default current_date,
  start_time timestamptz,
  end_time timestamptz,
  total_duration_seconds integer,
  planned_score integer,
  earned_score integer not null default 0,
  perceived_effort perceived_effort_type,
  mood_before smallint check (mood_before between 1 and 5),
  mood_after smallint check (mood_after between 1 and 5),
  energy_before smallint check (energy_before between 1 and 5),
  energy_after smallint check (energy_after between 1 and 5),
  discomfort text,
  notes text,
  status session_status_type not null default 'em_andamento',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workout_sessions_user_date_idx on workout_sessions(user_id, session_date);

create trigger workout_sessions_set_updated_at
  before update on workout_sessions
  for each row execute function set_updated_at();

alter table workout_sessions enable row level security;

create policy "workout_sessions_all_own" on workout_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table exercise_session_progress (
  id uuid primary key default gen_random_uuid(),
  workout_session_id uuid not null references workout_sessions(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  planned_sets smallint,
  completed_sets smallint not null default 0,
  planned_repetitions smallint,
  completed_repetitions smallint not null default 0,
  planned_duration_seconds integer,
  completed_duration_seconds integer not null default 0,
  weight_used numeric,
  earned_score integer not null default 0,
  status session_status_type not null default 'em_andamento',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index exercise_session_progress_session_idx on exercise_session_progress(workout_session_id);

create trigger exercise_session_progress_set_updated_at
  before update on exercise_session_progress
  for each row execute function set_updated_at();

alter table exercise_session_progress enable row level security;

create policy "exercise_session_progress_all_own" on exercise_session_progress
  for all using (
    exists (select 1 from workout_sessions s where s.id = workout_session_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from workout_sessions s where s.id = workout_session_id and s.user_id = auth.uid())
  );

-- ============================================================
-- SEED: biblioteca inicial de exercícios
-- Peso corporal, padrão, seguros — sem equipamento, sem posturas inventadas.
-- ============================================================

insert into exercises (name, description, muscle_group, objective, instructions, breathing_instructions, common_mistakes, precautions, difficulty, equipment) values

('Agachamento', 'Exercício fundamental pra pernas e glúteos.', 'Pernas e glúteos',
 'Fortalecer quadríceps, glúteos e posteriores de coxa.',
 'Pés na largura dos ombros. Desça flexionando quadril e joelhos, como se fosse sentar numa cadeira, mantendo o peito erguido e o peso nos calcanhares. Suba estendendo as pernas.',
 'Inspire descendo, expire subindo.',
 'Joelhos ultrapassando muito a ponta dos pés; deixar o peito cair pra frente; não descer o suficiente.',
 'Interrompa o exercício caso sinta dor, tontura ou mal-estar. Em caso de dúvidas ou limitações, procure orientação profissional.',
 'iniciante', null),

('Prancha', 'Isometria pra fortalecer o core.', 'Abdômen',
 'Fortalecer abdômen e estabilizadores da coluna.',
 'Apoie antebraços e pontas dos pés no chão, corpo reto da cabeça aos calcanhares, abdômen contraído. Mantenha a posição.',
 'Respiração natural e contínua, sem prender o ar.',
 'Deixar o quadril cair ou subir demais; prender a respiração.',
 'Interrompa o exercício caso sinta dor, tontura ou mal-estar. Em caso de dúvidas ou limitações, procure orientação profissional.',
 'iniciante', null),

('Flexão de braço', 'Fortalecimento de peito, ombros e tríceps — pode ser feita com os joelhos apoiados.', 'Braços e peito',
 'Fortalecer peito, ombros e tríceps.',
 'Mãos um pouco mais abertas que os ombros, corpo reto. Desça flexionando os cotovelos até quase tocar o chão, depois empurre de volta. Versão facilitada: com os joelhos apoiados.',
 'Inspire descendo, expire subindo.',
 'Abrir demais os cotovelos; deixar o quadril cair.',
 'Interrompa o exercício caso sinta dor, tontura ou mal-estar. Em caso de dúvidas ou limitações, procure orientação profissional.',
 'intermediario', null),

('Ponte de glúteo', 'Ativação de glúteos e posterior de coxa deitada.', 'Glúteos',
 'Fortalecer glúteos e posteriores de coxa, aliviar tensão lombar.',
 'Deitada de costas, joelhos flexionados, pés apoiados no chão. Eleve o quadril contraindo os glúteos até formar uma linha reta dos ombros aos joelhos, depois desça com controle.',
 'Expire subindo o quadril, inspire descendo.',
 'Hiperestender demais a lombar no topo do movimento.',
 'Interrompa o exercício caso sinta dor, tontura ou mal-estar. Em caso de dúvidas ou limitações, procure orientação profissional.',
 'iniciante', null),

('Afundo', 'Exercício unilateral pra pernas e glúteos.', 'Pernas',
 'Fortalecer pernas e glúteos, trabalhar equilíbrio.',
 'Dê um passo à frente e desça flexionando os dois joelhos a cerca de 90°, joelho de trás quase tocando o chão. Empurre de volta à posição inicial e alterne o lado.',
 'Inspire descendo, expire subindo.',
 'Deixar o joelho da frente ultrapassar muito a ponta do pé; perder o equilíbrio por ir rápido demais.',
 'Interrompa o exercício caso sinta dor, tontura ou mal-estar. Em caso de dúvidas ou limitações, procure orientação profissional.',
 'intermediario', null),

('Alongamento de panturrilha', 'Alongamento estático pra parte de trás da perna.', 'Alongamento',
 'Aliviar tensão na panturrilha.',
 'Apoie as mãos numa parede, uma perna atrás com o calcanhar no chão e o joelho esticado. Incline o corpo pra frente até sentir o alongamento na panturrilha de trás.',
 'Respiração lenta e profunda durante o alongamento.',
 'Forçar além do confortável; tirar o calcanhar do chão.',
 'Interrompa o exercício caso sinta dor, tontura ou mal-estar. Em caso de dúvidas ou limitações, procure orientação profissional.',
 'iniciante', null),

('Alongamento de posterior de coxa', 'Alongamento estático pra parte de trás da coxa.', 'Alongamento',
 'Aliviar tensão nos posteriores de coxa.',
 'Sentada, uma perna esticada à frente e a outra flexionada. Incline o tronco pra frente a partir do quadril, mantendo as costas retas, até sentir o alongamento.',
 'Respiração lenta e profunda durante o alongamento.',
 'Arredondar muito as costas em vez de dobrar pelo quadril.',
 'Interrompa o exercício caso sinta dor, tontura ou mal-estar. Em caso de dúvidas ou limitações, procure orientação profissional.',
 'iniciante', null),

('Rotação de tronco', 'Mobilidade pra coluna torácica.', 'Mobilidade',
 'Melhorar mobilidade da coluna.',
 'Sentada ou em pé, gire o tronco suavemente pra um lado e depois pro outro, mantendo o quadril estável.',
 'Expire a cada rotação.',
 'Fazer movimentos bruscos ou forçados.',
 'Interrompa o exercício caso sinta dor, tontura ou mal-estar. Em caso de dúvidas ou limitações, procure orientação profissional.',
 'iniciante', null),

('Círculos de ombro', 'Mobilidade pra articulação do ombro.', 'Mobilidade',
 'Soltar tensão e melhorar mobilidade dos ombros.',
 'Em pé, braços relaxados ao lado do corpo. Faça círculos lentos com os ombros pra frente e depois pra trás.',
 'Respiração natural durante o movimento.',
 'Fazer o movimento rápido demais.',
 'Interrompa o exercício caso sinta dor, tontura ou mal-estar. Em caso de dúvidas ou limitações, procure orientação profissional.',
 'iniciante', null),

('Elevação lateral de perna', 'Trabalho de glúteo médio e estabilidade do quadril.', 'Glúteos e pernas',
 'Fortalecer glúteo médio.',
 'Deitada de lado, pernas esticadas e alinhadas. Eleve a perna de cima mantendo o quadril estável, depois desça com controle.',
 'Expire elevando a perna, inspire descendo.',
 'Deixar o quadril rolar pra trás durante o movimento.',
 'Interrompa o exercício caso sinta dor, tontura ou mal-estar. Em caso de dúvidas ou limitações, procure orientação profissional.',
 'iniciante', null),

('Abdominal', 'Ativação da porção superior do abdômen.', 'Abdômen',
 'Fortalecer a musculatura abdominal.',
 'Deitada, joelhos flexionados e pés apoiados. Eleve a cabeça e os ombros do chão contraindo o abdômen, depois desça com controle.',
 'Expire subindo, inspire descendo.',
 'Puxar o pescoço com as mãos; usar impulso em vez do abdômen.',
 'Interrompa o exercício caso sinta dor, tontura ou mal-estar. Em caso de dúvidas ou limitações, procure orientação profissional.',
 'iniciante', null),

('Superman', 'Fortalecimento da lombar e glúteos deitada de bruços.', 'Costas',
 'Fortalecer lombar, glúteos e costas.',
 'Deitada de bruços, braços estendidos à frente. Eleve braços e pernas simultaneamente alguns centímetros do chão, segure brevemente e desça.',
 'Expire elevando, inspire descendo.',
 'Elevar demais gerando desconforto na lombar.',
 'Interrompa o exercício caso sinta dor, tontura ou mal-estar. Em caso de dúvidas ou limitações, procure orientação profissional.',
 'iniciante', null),

('Marcha estacionária', 'Cardio leve, bom aquecimento.', 'Cardio',
 'Elevar a frequência cardíaca de forma leve.',
 'Em pé, marche no lugar elevando os joelhos numa altura confortável, balançando os braços naturalmente.',
 'Respiração natural, ritmada com o movimento.',
 'Elevar demais os joelhos ao ponto de perder o equilíbrio.',
 'Interrompa o exercício caso sinta dor, tontura ou mal-estar. Em caso de dúvidas ou limitações, procure orientação profissional.',
 'iniciante', null),

('Polichinelo', 'Cardio clássico de corpo inteiro.', 'Cardio',
 'Elevar a frequência cardíaca, trabalhar coordenação.',
 'Em pé, salte abrindo pernas e braços simultaneamente, depois volte à posição inicial no salto seguinte.',
 'Respiração ritmada com o movimento.',
 'Aterrissar com as pernas muito travadas.',
 'Interrompa o exercício caso sinta dor, tontura ou mal-estar. Em caso de dúvidas ou limitações, procure orientação profissional.',
 'intermediario', null),

('Gato-vaca', 'Mobilidade suave pra coluna.', 'Mobilidade',
 'Soltar a coluna, aliviar tensão nas costas.',
 'Em quatro apoios. Ao inspirar, arqueie as costas pra baixo olhando pra frente (vaca). Ao expirar, arredonde as costas pra cima, queixo em direção ao peito (gato).',
 'Inspire arqueando, expire arredondando.',
 'Fazer o movimento rápido demais em vez de fluido.',
 'Interrompa o exercício caso sinta dor, tontura ou mal-estar. Em caso de dúvidas ou limitações, procure orientação profissional.',
 'iniciante', null),

('Elevação de panturrilha', 'Fortalecimento da panturrilha em pé.', 'Pernas',
 'Fortalecer panturrilhas.',
 'Em pé, eleve os calcanhares ficando na ponta dos pés, depois desça com controle. Pode se apoiar numa parede pra equilíbrio.',
 'Expire subindo, inspire descendo.',
 'Fazer o movimento rápido demais, sem controle na descida.',
 'Interrompa o exercício caso sinta dor, tontura ou mal-estar. Em caso de dúvidas ou limitações, procure orientação profissional.',
 'iniciante', null);

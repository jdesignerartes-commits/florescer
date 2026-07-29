export type ExerciseDifficulty = "iniciante" | "intermediario" | "avancado";
export type SideMode = "ambos" | "direito" | "esquerdo" | "nenhum";
export type ScoreMode = "integral" | "proporcional";
export type SessionStatus = "em_andamento" | "concluido" | "abandonado";
export type PerceivedEffort =
  | "muito_leve"
  | "leve"
  | "moderado"
  | "intenso"
  | "muito_intenso";
export type Discomfort =
  | "nenhum"
  | "dor"
  | "tontura"
  | "falta_ar"
  | "fraqueza"
  | "outro";

export const DIFFICULTY_LABELS: Record<ExerciseDifficulty, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export const EFFORT_LABELS: Record<PerceivedEffort, string> = {
  muito_leve: "Muito leve",
  leve: "Leve",
  moderado: "Moderado",
  intenso: "Intenso",
  muito_intenso: "Muito intenso",
};

export const DISCOMFORT_LABELS: Record<Discomfort, string> = {
  nenhum: "Não",
  dor: "Dor",
  tontura: "Tontura",
  falta_ar: "Falta de ar",
  fraqueza: "Fraqueza",
  outro: "Outro",
};

export const SAFETY_NOTICE =
  "Interrompa o exercício caso sinta dor, tontura ou mal-estar. Em caso de dúvidas ou limitações, procure orientação profissional.";

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroup: string;
  objective: string;
  instructions: string;
  breathingInstructions: string;
  commonMistakes: string;
  precautions: string;
  difficulty: ExerciseDifficulty;
  equipment: string | null;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  orderIndex: number;
  sets: number | null;
  repetitions: number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
  sideMode: SideMode;
  score: number;
  scoreMode: ScoreMode;
  notes: string;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  scheduledDays: number[];
  active: boolean;
  exercises: WorkoutExercise[];
}

export interface ExerciseProgress {
  workoutExerciseId: string;
  exerciseId: string;
  plannedSets: number | null;
  completedSets: number;
  plannedRepetitions: number | null;
  completedRepetitions: number;
  plannedDurationSeconds: number | null;
  completedDurationSeconds: number;
  earnedScore: number;
  status: SessionStatus;
}

export interface WorkoutSession {
  id: string;
  workoutId: string | null;
  workoutName: string;
  sessionDate: string;
  startedAt: string;
  endedAt: string | null;
  plannedScore: number;
  earnedScore: number;
  perceivedEffort: PerceivedEffort | null;
  moodBefore: number | null;
  moodAfter: number | null;
  energyBefore: number | null;
  energyAfter: number | null;
  discomfort: Discomfort | null;
  notes: string;
  status: SessionStatus;
  progress: ExerciseProgress[];
}

// Espelha a seed de `exercises` em supabase/migrations/0003_expansion.sql —
// mantida local por enquanto (mesmo motivo do resto do app: sem login ainda,
// não dá pra ligar no Supabase). `exercises` no banco é biblioteca pública,
// então quando o login voltar essa lista pode vir de lá em vez de fixa aqui.
export const EXERCISE_LIBRARY: Exercise[] = [
  {
    id: "agachamento",
    name: "Agachamento",
    description: "Exercício fundamental pra pernas e glúteos.",
    muscleGroup: "Pernas e glúteos",
    objective: "Fortalecer quadríceps, glúteos e posteriores de coxa.",
    instructions:
      "Pés na largura dos ombros. Desça flexionando quadril e joelhos, como se fosse sentar numa cadeira, mantendo o peito erguido e o peso nos calcanhares. Suba estendendo as pernas.",
    breathingInstructions: "Inspire descendo, expire subindo.",
    commonMistakes:
      "Joelhos ultrapassando muito a ponta dos pés; deixar o peito cair pra frente; não descer o suficiente.",
    precautions: SAFETY_NOTICE,
    difficulty: "iniciante",
    equipment: null,
  },
  {
    id: "prancha",
    name: "Prancha",
    description: "Isometria pra fortalecer o core.",
    muscleGroup: "Abdômen",
    objective: "Fortalecer abdômen e estabilizadores da coluna.",
    instructions:
      "Apoie antebraços e pontas dos pés no chão, corpo reto da cabeça aos calcanhares, abdômen contraído. Mantenha a posição.",
    breathingInstructions: "Respiração natural e contínua, sem prender o ar.",
    commonMistakes: "Deixar o quadril cair ou subir demais; prender a respiração.",
    precautions: SAFETY_NOTICE,
    difficulty: "iniciante",
    equipment: null,
  },
  {
    id: "flexao",
    name: "Flexão de braço",
    description:
      "Fortalecimento de peito, ombros e tríceps — pode ser feita com os joelhos apoiados.",
    muscleGroup: "Braços e peito",
    objective: "Fortalecer peito, ombros e tríceps.",
    instructions:
      "Mãos um pouco mais abertas que os ombros, corpo reto. Desça flexionando os cotovelos até quase tocar o chão, depois empurre de volta. Versão facilitada: com os joelhos apoiados.",
    breathingInstructions: "Inspire descendo, expire subindo.",
    commonMistakes: "Abrir demais os cotovelos; deixar o quadril cair.",
    precautions: SAFETY_NOTICE,
    difficulty: "intermediario",
    equipment: null,
  },
  {
    id: "ponte-glutea",
    name: "Ponte de glúteo",
    description: "Ativação de glúteos e posterior de coxa deitada.",
    muscleGroup: "Glúteos",
    objective: "Fortalecer glúteos e posteriores de coxa, aliviar tensão lombar.",
    instructions:
      "Deitada de costas, joelhos flexionados, pés apoiados no chão. Eleve o quadril contraindo os glúteos até formar uma linha reta dos ombros aos joelhos, depois desça com controle.",
    breathingInstructions: "Expire subindo o quadril, inspire descendo.",
    commonMistakes: "Hiperestender demais a lombar no topo do movimento.",
    precautions: SAFETY_NOTICE,
    difficulty: "iniciante",
    equipment: null,
  },
  {
    id: "afundo",
    name: "Afundo",
    description: "Exercício unilateral pra pernas e glúteos.",
    muscleGroup: "Pernas",
    objective: "Fortalecer pernas e glúteos, trabalhar equilíbrio.",
    instructions:
      "Dê um passo à frente e desça flexionando os dois joelhos a cerca de 90°, joelho de trás quase tocando o chão. Empurre de volta à posição inicial e alterne o lado.",
    breathingInstructions: "Inspire descendo, expire subindo.",
    commonMistakes:
      "Deixar o joelho da frente ultrapassar muito a ponta do pé; perder o equilíbrio por ir rápido demais.",
    precautions: SAFETY_NOTICE,
    difficulty: "intermediario",
    equipment: null,
  },
  {
    id: "alongamento-panturrilha",
    name: "Alongamento de panturrilha",
    description: "Alongamento estático pra parte de trás da perna.",
    muscleGroup: "Alongamento",
    objective: "Aliviar tensão na panturrilha.",
    instructions:
      "Apoie as mãos numa parede, uma perna atrás com o calcanhar no chão e o joelho esticado. Incline o corpo pra frente até sentir o alongamento na panturrilha de trás.",
    breathingInstructions: "Respiração lenta e profunda durante o alongamento.",
    commonMistakes: "Forçar além do confortável; tirar o calcanhar do chão.",
    precautions: SAFETY_NOTICE,
    difficulty: "iniciante",
    equipment: null,
  },
  {
    id: "alongamento-posterior",
    name: "Alongamento de posterior de coxa",
    description: "Alongamento estático pra parte de trás da coxa.",
    muscleGroup: "Alongamento",
    objective: "Aliviar tensão nos posteriores de coxa.",
    instructions:
      "Sentada, uma perna esticada à frente e a outra flexionada. Incline o tronco pra frente a partir do quadril, mantendo as costas retas, até sentir o alongamento.",
    breathingInstructions: "Respiração lenta e profunda durante o alongamento.",
    commonMistakes: "Arredondar muito as costas em vez de dobrar pelo quadril.",
    precautions: SAFETY_NOTICE,
    difficulty: "iniciante",
    equipment: null,
  },
  {
    id: "rotacao-tronco",
    name: "Rotação de tronco",
    description: "Mobilidade pra coluna torácica.",
    muscleGroup: "Mobilidade",
    objective: "Melhorar mobilidade da coluna.",
    instructions:
      "Sentada ou em pé, gire o tronco suavemente pra um lado e depois pro outro, mantendo o quadril estável.",
    breathingInstructions: "Expire a cada rotação.",
    commonMistakes: "Fazer movimentos bruscos ou forçados.",
    precautions: SAFETY_NOTICE,
    difficulty: "iniciante",
    equipment: null,
  },
  {
    id: "circulos-ombro",
    name: "Círculos de ombro",
    description: "Mobilidade pra articulação do ombro.",
    muscleGroup: "Mobilidade",
    objective: "Soltar tensão e melhorar mobilidade dos ombros.",
    instructions:
      "Em pé, braços relaxados ao lado do corpo. Faça círculos lentos com os ombros pra frente e depois pra trás.",
    breathingInstructions: "Respiração natural durante o movimento.",
    commonMistakes: "Fazer o movimento rápido demais.",
    precautions: SAFETY_NOTICE,
    difficulty: "iniciante",
    equipment: null,
  },
  {
    id: "elevacao-lateral-perna",
    name: "Elevação lateral de perna",
    description: "Trabalho de glúteo médio e estabilidade do quadril.",
    muscleGroup: "Glúteos e pernas",
    objective: "Fortalecer glúteo médio.",
    instructions:
      "Deitada de lado, pernas esticadas e alinhadas. Eleve a perna de cima mantendo o quadril estável, depois desça com controle.",
    breathingInstructions: "Expire elevando a perna, inspire descendo.",
    commonMistakes: "Deixar o quadril rolar pra trás durante o movimento.",
    precautions: SAFETY_NOTICE,
    difficulty: "iniciante",
    equipment: null,
  },
  {
    id: "abdominal",
    name: "Abdominal",
    description: "Ativação da porção superior do abdômen.",
    muscleGroup: "Abdômen",
    objective: "Fortalecer a musculatura abdominal.",
    instructions:
      "Deitada, joelhos flexionados e pés apoiados. Eleve a cabeça e os ombros do chão contraindo o abdômen, depois desça com controle.",
    breathingInstructions: "Expire subindo, inspire descendo.",
    commonMistakes: "Puxar o pescoço com as mãos; usar impulso em vez do abdômen.",
    precautions: SAFETY_NOTICE,
    difficulty: "iniciante",
    equipment: null,
  },
  {
    id: "superman",
    name: "Superman",
    description: "Fortalecimento da lombar e glúteos deitada de bruços.",
    muscleGroup: "Costas",
    objective: "Fortalecer lombar, glúteos e costas.",
    instructions:
      "Deitada de bruços, braços estendidos à frente. Eleve braços e pernas simultaneamente alguns centímetros do chão, segure brevemente e desça.",
    breathingInstructions: "Expire elevando, inspire descendo.",
    commonMistakes: "Elevar demais gerando desconforto na lombar.",
    precautions: SAFETY_NOTICE,
    difficulty: "iniciante",
    equipment: null,
  },
  {
    id: "marcha-estacionaria",
    name: "Marcha estacionária",
    description: "Cardio leve, bom aquecimento.",
    muscleGroup: "Cardio",
    objective: "Elevar a frequência cardíaca de forma leve.",
    instructions:
      "Em pé, marche no lugar elevando os joelhos numa altura confortável, balançando os braços naturalmente.",
    breathingInstructions: "Respiração natural, ritmada com o movimento.",
    commonMistakes: "Elevar demais os joelhos ao ponto de perder o equilíbrio.",
    precautions: SAFETY_NOTICE,
    difficulty: "iniciante",
    equipment: null,
  },
  {
    id: "polichinelo",
    name: "Polichinelo",
    description: "Cardio clássico de corpo inteiro.",
    muscleGroup: "Cardio",
    objective: "Elevar a frequência cardíaca, trabalhar coordenação.",
    instructions:
      "Em pé, salte abrindo pernas e braços simultaneamente, depois volte à posição inicial no salto seguinte.",
    breathingInstructions: "Respiração ritmada com o movimento.",
    commonMistakes: "Aterrissar com as pernas muito travadas.",
    precautions: SAFETY_NOTICE,
    difficulty: "intermediario",
    equipment: null,
  },
  {
    id: "gato-vaca",
    name: "Gato-vaca",
    description: "Mobilidade suave pra coluna.",
    muscleGroup: "Mobilidade",
    objective: "Soltar a coluna, aliviar tensão nas costas.",
    instructions:
      "Em quatro apoios. Ao inspirar, arqueie as costas pra baixo olhando pra frente (vaca). Ao expirar, arredonde as costas pra cima, queixo em direção ao peito (gato).",
    breathingInstructions: "Inspire arqueando, expire arredondando.",
    commonMistakes: "Fazer o movimento rápido demais em vez de fluido.",
    precautions: SAFETY_NOTICE,
    difficulty: "iniciante",
    equipment: null,
  },
  {
    id: "elevacao-panturrilha",
    name: "Elevação de panturrilha",
    description: "Fortalecimento da panturrilha em pé.",
    muscleGroup: "Pernas",
    objective: "Fortalecer panturrilhas.",
    instructions:
      "Em pé, eleve os calcanhares ficando na ponta dos pés, depois desça com controle. Pode se apoiar numa parede pra equilíbrio.",
    breathingInstructions: "Expire subindo, inspire descendo.",
    commonMistakes: "Fazer o movimento rápido demais, sem controle na descida.",
    precautions: SAFETY_NOTICE,
    difficulty: "iniciante",
    equipment: null,
  },
];

export function getExercise(id: string): Exercise | undefined {
  return EXERCISE_LIBRARY.find((e) => e.id === id);
}

function we(
  id: string,
  exerciseId: string,
  orderIndex: number,
  opts: Partial<WorkoutExercise> = {}
): WorkoutExercise {
  return {
    id,
    exerciseId,
    orderIndex,
    sets: 3,
    repetitions: 12,
    durationSeconds: null,
    restSeconds: 30,
    sideMode: "nenhum",
    score: 10,
    scoreMode: "integral",
    notes: "",
    ...opts,
  };
}

export const INITIAL_WORKOUTS: Workout[] = [
  {
    id: "alongamento",
    name: "Alongamento",
    description: "Sequência leve pra soltar o corpo.",
    scheduledDays: [],
    active: true,
    exercises: [
      we("we1", "gato-vaca", 0, { sets: 1, repetitions: 8, restSeconds: 15, score: 5 }),
      we("we2", "alongamento-panturrilha", 1, { sets: 1, repetitions: null, durationSeconds: 30, restSeconds: 15, score: 5 }),
      we("we3", "alongamento-posterior", 2, { sets: 1, repetitions: null, durationSeconds: 30, restSeconds: 15, score: 5 }),
      we("we4", "rotacao-tronco", 3, { sets: 1, repetitions: 10, restSeconds: 15, score: 5 }),
    ],
  },
  {
    id: "corpo-inteiro",
    name: "Corpo inteiro",
    description: "Treino curto trabalhando os principais grupos.",
    scheduledDays: [],
    active: true,
    exercises: [
      we("we5", "agachamento", 0, { score: 15, scoreMode: "proporcional" }),
      we("we6", "flexao", 1, { sets: 3, repetitions: 8, score: 15, scoreMode: "proporcional" }),
      we("we7", "ponte-glutea", 2, { score: 10, scoreMode: "proporcional" }),
      we("we8", "prancha", 3, { sets: 3, repetitions: null, durationSeconds: 30, score: 10, scoreMode: "proporcional" }),
    ],
  },
  {
    id: "caminhada",
    name: "Caminhada",
    description: "Cardio leve.",
    scheduledDays: [],
    active: true,
    exercises: [
      we("we9", "marcha-estacionaria", 0, { sets: 1, repetitions: null, durationSeconds: 600, restSeconds: 0, score: 20, scoreMode: "proporcional" }),
    ],
  },
  {
    id: "treino-rapido",
    name: "Treino rápido",
    description: "Pra quando o tempo é curto.",
    scheduledDays: [],
    active: true,
    exercises: [
      we("we10", "polichinelo", 0, { sets: 2, repetitions: 15, score: 10, scoreMode: "proporcional" }),
      we("we11", "agachamento", 1, { sets: 2, repetitions: 12, score: 10, scoreMode: "proporcional" }),
      we("we12", "prancha", 2, { sets: 2, repetitions: null, durationSeconds: 20, score: 10, scoreMode: "proporcional" }),
    ],
  },
];

export function plannedScore(workout: Workout): number {
  return workout.exercises.reduce((sum, we) => sum + we.score, 0);
}

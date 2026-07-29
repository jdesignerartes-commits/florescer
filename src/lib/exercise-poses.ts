// Poses de uma figura articulada simples (boneco-palito) usada pra ilustrar
// cada exercício. Ângulos em "hora do relógio": 0 = apontando pra cima,
// 90 = direita, 180 = baixo, 270 = esquerda, sentido horário.
export interface PoseAngles {
  torso: number;
  armL: number;
  armLElbow: number;
  armR: number;
  armRElbow: number;
  legL: number;
  legLKnee: number;
  legR: number;
  legRKnee: number;
  /** Rotação da figura inteira em volta do quadril — 0 em pé, 90/-90 deitada. */
  rotate: number;
  /** Ajuste vertical do quadril (pra caber melhor no viewBox quando deitada/agachada). */
  hipYOffset: number;
}

const STANDING: PoseAngles = {
  torso: 0,
  armL: 165,
  armLElbow: 180,
  armR: 195,
  armRElbow: 180,
  legL: 170,
  legLKnee: 180,
  legR: 190,
  legRKnee: 180,
  rotate: 0,
  hipYOffset: 0,
};

export type ExercisePoseSet =
  | { mode: "hold"; pose: PoseAngles }
  | { mode: "loop"; from: PoseAngles; to: PoseAngles };

export const EXERCISE_POSES: Record<string, ExercisePoseSet> = {
  // Agachamento — em pé, desce dobrando quadril e joelho.
  agachamento: {
    mode: "loop",
    from: STANDING,
    to: {
      ...STANDING,
      torso: -8,
      armL: 320,
      armLElbow: 320,
      armR: 40,
      armRElbow: 40,
      legL: 155,
      legLKnee: 130,
      legR: 205,
      legRKnee: 230,
      hipYOffset: 7,
    },
  },

  // Prancha — isometria, deitada de bruços apoiada nos antebraços.
  // Nota sobre os ângulos dos braços nas poses rotacionadas (prancha, flexão,
  // superman, gato-vaca): depois da rotação de -90°/90° da figura inteira,
  // um par de braços "espelhado" (padrão usado nas poses em pé) acaba
  // apontando pra direções opostas na tela em vez de ambos pra baixo/frente.
  // Por isso aqui os dois braços usam ângulos parecidos (não espelhados).
  prancha: {
    mode: "hold",
    pose: {
      ...STANDING,
      rotate: -90,
      torso: 0,
      armL: 200,
      armLElbow: 230,
      armR: 210,
      armRElbow: 240,
      legL: 178,
      legR: 182,
      hipYOffset: -6,
    },
  },

  // Flexão de braço — de bruços, cotovelos dobram e esticam.
  flexao: {
    mode: "loop",
    from: {
      ...STANDING,
      rotate: -90,
      armL: 195,
      armLElbow: 195,
      armR: 205,
      armRElbow: 205,
      legL: 178,
      legR: 182,
      hipYOffset: -6,
    },
    to: {
      ...STANDING,
      rotate: -90,
      armL: 195,
      armLElbow: 255,
      armR: 205,
      armRElbow: 265,
      legL: 178,
      legR: 182,
      hipYOffset: -6,
      torso: 8,
    },
  },

  // Ponte de glúteo — deitada de costas, eleva o quadril.
  "ponte-glutea": {
    mode: "loop",
    from: {
      ...STANDING,
      rotate: 90,
      torso: 0,
      armL: 178,
      armR: 182,
      legL: 130,
      legLKnee: 150,
      legR: 230,
      legRKnee: 210,
      hipYOffset: 0,
    },
    to: {
      ...STANDING,
      rotate: 90,
      torso: 10,
      armL: 178,
      armR: 182,
      legL: 130,
      legLKnee: 150,
      legR: 230,
      legRKnee: 210,
      hipYOffset: -14,
    },
  },

  // Afundo — passo à frente, os dois joelhos dobram (assimétrico).
  afundo: {
    mode: "loop",
    from: STANDING,
    to: {
      ...STANDING,
      torso: 0,
      armL: 150,
      armLElbow: 150,
      armR: 210,
      armRElbow: 210,
      legL: 140,
      legLKnee: 120,
      legR: 200,
      legRKnee: 235,
      hipYOffset: 6,
    },
  },

  // Alongamento de panturrilha — isometria, um passo atrás apoiada na parede.
  "alongamento-panturrilha": {
    mode: "hold",
    pose: {
      ...STANDING,
      torso: -14,
      armL: 95,
      armLElbow: 150,
      armR: 260,
      armRElbow: 210,
      legL: 155,
      legR: 195,
      legRKnee: 178,
    },
  },

  // Alongamento de posterior de coxa — sentada, tronco inclina pra frente.
  "alongamento-posterior": {
    mode: "hold",
    pose: {
      ...STANDING,
      rotate: 90,
      torso: -35,
      armL: 60,
      armLElbow: 60,
      armR: 300,
      armRElbow: 300,
      legL: 175,
      legR: 185,
      hipYOffset: 4,
    },
  },

  // Rotação de tronco — em pé, gira o tronco pros lados (movimento nos ombros/braços).
  "rotacao-tronco": {
    mode: "loop",
    from: {
      ...STANDING,
      armL: 110,
      armLElbow: 150,
      armR: 250,
      armRElbow: 210,
    },
    to: {
      ...STANDING,
      armL: 250,
      armLElbow: 210,
      armR: 110,
      armRElbow: 150,
    },
  },

  // Círculos de ombro — em pé, braços fazem círculo (aproximado por vai-e-vem).
  "circulos-ombro": {
    mode: "loop",
    from: { ...STANDING, armL: 165, armLElbow: 165, armR: 195, armRElbow: 195 },
    to: { ...STANDING, armL: 320, armLElbow: 320, armR: 40, armRElbow: 40 },
  },

  // Elevação lateral de perna — deitada de lado, eleva a perna de cima.
  "elevacao-lateral-perna": {
    mode: "loop",
    from: {
      ...STANDING,
      rotate: 90,
      armL: 178,
      armR: 182,
      legL: 178,
      legR: 182,
    },
    to: {
      ...STANDING,
      rotate: 90,
      armL: 178,
      armR: 182,
      legL: 178,
      legR: 220,
    },
  },

  // Abdominal — deitada de costas, eleva cabeça/ombros contraindo o abdômen.
  abdominal: {
    mode: "loop",
    from: {
      ...STANDING,
      rotate: 90,
      torso: 0,
      armL: 130,
      armLElbow: 130,
      armR: 230,
      armRElbow: 230,
      legL: 130,
      legLKnee: 150,
      legR: 230,
      legRKnee: 210,
    },
    to: {
      ...STANDING,
      rotate: 90,
      torso: 30,
      armL: 130,
      armLElbow: 130,
      armR: 230,
      armRElbow: 230,
      legL: 130,
      legLKnee: 150,
      legR: 230,
      legRKnee: 210,
    },
  },

  // Superman — de bruços, eleva braços e pernas juntos.
  superman: {
    mode: "loop",
    from: {
      ...STANDING,
      rotate: -90,
      armL: 20,
      armLElbow: 20,
      armR: 340,
      armRElbow: 340,
      legL: 178,
      legR: 182,
      hipYOffset: -6,
    },
    to: {
      ...STANDING,
      rotate: -90,
      torso: -10,
      armL: 5,
      armLElbow: 5,
      armR: 355,
      armRElbow: 355,
      legL: 165,
      legR: 195,
      hipYOffset: -6,
    },
  },

  // Marcha estacionária — em pé, joelhos alternam subindo (usa o vai-e-vem assimétrico).
  "marcha-estacionaria": {
    mode: "loop",
    from: {
      ...STANDING,
      armL: 120,
      armLElbow: 120,
      armR: 190,
      armRElbow: 190,
      legL: 105,
      legLKnee: 130,
      legR: 190,
    },
    to: {
      ...STANDING,
      armL: 165,
      armLElbow: 165,
      armR: 245,
      armRElbow: 245,
      legL: 170,
      legR: 105,
      legRKnee: 130,
    },
  },

  // Polichinelo — salto abrindo pernas e braços.
  polichinelo: {
    mode: "loop",
    from: STANDING,
    to: {
      ...STANDING,
      armL: 20,
      armLElbow: 20,
      armR: 340,
      armRElbow: 340,
      legL: 145,
      legR: 215,
    },
  },

  // Gato-vaca — quatro apoios, arqueia e arredonda a coluna.
  "gato-vaca": {
    mode: "loop",
    from: {
      ...STANDING,
      rotate: -90,
      torso: -6,
      armL: 200,
      armLElbow: 200,
      armR: 210,
      armRElbow: 210,
      legL: 178,
      legLKnee: 260,
      legR: 182,
      legRKnee: 100,
      hipYOffset: -4,
    },
    to: {
      ...STANDING,
      rotate: -90,
      torso: 10,
      armL: 200,
      armLElbow: 200,
      armR: 210,
      armRElbow: 210,
      legL: 178,
      legLKnee: 260,
      legR: 182,
      legRKnee: 100,
      hipYOffset: -4,
    },
  },

  // Elevação de panturrilha — em pé, sobe na ponta dos pés (sutil, sobe o quadril um pouco).
  "elevacao-panturrilha": {
    mode: "loop",
    from: STANDING,
    to: { ...STANDING, hipYOffset: -6 },
  },
};

export function getExercisePoseSet(exerciseId: string): ExercisePoseSet {
  return EXERCISE_POSES[exerciseId] ?? { mode: "hold", pose: STANDING };
}

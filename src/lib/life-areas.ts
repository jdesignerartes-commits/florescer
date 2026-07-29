import {
  Leaf,
  Heart,
  HandHeart,
  BookOpen,
  Home,
  Users,
  Coins,
  Palette,
  Footprints,
  Flower,
  Target,
  type LucideIcon,
} from "lucide-react";

export type Tone = "terracota" | "oliva" | "caramelo" | "marigold" | "marinho";

export interface LifeArea {
  slug: string;
  name: string;
  icon: LucideIcon;
  tone: Tone;
}

// Espelha a seed de life_areas em supabase/migrations/0001_init_schema.sql.
export const LIFE_AREAS: LifeArea[] = [
  { slug: "saude", name: "Saúde", icon: Leaf, tone: "terracota" },
  { slug: "autocuidado", name: "Autocuidado", icon: Heart, tone: "marigold" },
  { slug: "espiritualidade", name: "Espiritualidade", icon: HandHeart, tone: "marinho" },
  { slug: "estudos", name: "Estudos", icon: BookOpen, tone: "caramelo" },
  { slug: "casa", name: "Casa", icon: Home, tone: "oliva" },
  { slug: "familia", name: "Família", icon: Users, tone: "marigold" },
  { slug: "financas", name: "Finanças", icon: Coins, tone: "caramelo" },
  { slug: "hobby", name: "Hobby", icon: Palette, tone: "terracota" },
  { slug: "movimento", name: "Movimento", icon: Footprints, tone: "oliva" },
  { slug: "bem_estar", name: "Bem-estar", icon: Flower, tone: "marigold" },
  { slug: "objetivos", name: "Objetivos", icon: Target, tone: "marinho" },
];

export const TONE_CLASSES: Record<Tone, string> = {
  terracota: "bg-terracota/15 text-terracota",
  oliva: "bg-oliva/15 text-oliva",
  caramelo: "bg-caramelo/20 text-caramelo",
  marigold: "bg-marigold/15 text-marigold",
  marinho: "bg-marinho/12 text-marinho",
};

export function getLifeArea(slug: string): LifeArea {
  return LIFE_AREAS.find((a) => a.slug === slug) ?? LIFE_AREAS[0];
}

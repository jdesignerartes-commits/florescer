import {
  Home,
  Repeat,
  Sun,
  History,
  Smile,
  BarChart3,
  Settings,
  BookHeart,
  HeartPulse,
  Dumbbell,
  Sprout,
  Shirt,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  /** Aparece como atalho na barra flutuante do mobile; o resto vive no menu "Mais". */
  primary?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Rotina diária",
    items: [
      { href: "/", label: "Home", icon: Home, primary: true },
      { href: "/hoje", label: "Hoje", icon: Sun, primary: true },
      {
        href: "/rotina",
        label: "Minha Rotina",
        shortLabel: "Rotina",
        icon: Repeat,
        primary: true,
      },
    ],
  },
  {
    label: "Bem-estar",
    items: [
      { href: "/versiculos", label: "Versículos de Ouro", shortLabel: "Versículos", icon: BookHeart },
      { href: "/saude", label: "Minha Saúde", shortLabel: "Saúde", icon: HeartPulse },
      { href: "/exercicios", label: "Meus Exercícios", shortLabel: "Exercícios", icon: Dumbbell },
      { href: "/jardim", label: "Jardim da Constância", shortLabel: "Jardim", icon: Sprout },
      { href: "/humor", label: "Humor", icon: Smile },
      { href: "/estilo", label: "Moda e Estilo", shortLabel: "Estilo", icon: Shirt },
    ],
  },
  {
    label: "Visão geral",
    items: [
      { href: "/historico", label: "Histórico", icon: History },
      { href: "/estatisticas", label: "Estatísticas", icon: BarChart3 },
      { href: "/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

export const navItems: NavItem[] = navGroups.flatMap((g) => g.items);
export const primaryNavItems: NavItem[] = navItems.filter((i) => i.primary);
export const secondaryNavItems: NavItem[] = navItems.filter((i) => !i.primary);

export function isNavItemActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

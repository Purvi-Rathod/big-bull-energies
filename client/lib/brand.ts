/** Big Bull Energies brand tokens — use across marketing pages for consistent color */
export const brand = {
  primary: "#05627C",
  primaryDeep: "#033D4D",
  primaryHover: "#045468",
  accent: "#3FA9C8",
  gold: "#F5CF0B",
  goldHover: "#E5C00A",
  dark: "#0B1F2A",
  muted: "#6b7c85",
  soft: "#E8F5F0",
  white: "#FFFFFF",
} as const;

export type BrandColor = (typeof brand)[keyof typeof brand];

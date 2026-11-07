export const routePaths = {
  calendar: "/calendario",
  contracts: "/contratos",
  assets: "/equipamentos",
} as const;

export function pageForPath(pathname: string): keyof typeof routePaths {
  const path = pathname.replace(/\/+$/, "");
  if (path === routePaths.contracts) return "contracts";
  if (path === routePaths.assets) return "assets";
  return "calendar";
}

/** Mantém os endereços compartilhados antes da adoção do React Router. */
export function legacyDestination(hash: string): string {
  if (hash === "#contratos") return routePaths.contracts;
  if (hash === "#equipamentos") return routePaths.assets;
  return routePaths.calendar;
}

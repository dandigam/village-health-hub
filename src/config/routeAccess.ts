/**
 * Centralized Role-Based Route Access Configuration
 * 
 * To add a new page:
 * 1. Add the route key and allowed roles here
 * 2. Add the route in App.tsx wrapped with <ProtectedRoute>
 * 3. Sidebar and route guard handle the rest automatically
 */

export type AppRole = "ADMIN" | "DOCTOR" | "NURSE" | "PHARMACIST" | "WARE_HOUSE" | "FRONT_DESK";

export const routeAccess: Record<string, AppRole[]> = {
  dashboard: ["ADMIN", "DOCTOR", "NURSE", "PHARMACIST", "WARE_HOUSE", "FRONT_DESK"],
  camps: ["ADMIN"],
  patients: ["ADMIN", "DOCTOR", "NURSE", "FRONT_DESK"],
  encounters: ["DOCTOR", "NURSE"],
  pharmacy: ["PHARMACIST", "ADMIN"],
  stock: ["WARE_HOUSE", "ADMIN"],
  doctors: ["ADMIN"],
  reports: ["ADMIN"],
};

/**
 * Check if a role has access to a route key
 */
export function hasAccess(routeKey: string, role: AppRole | undefined): boolean {
  if (!role) return false;
  const allowed = routeAccess[routeKey];
  if (!allowed) return false;
  return allowed.includes(role);
}

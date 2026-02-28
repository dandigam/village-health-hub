/**
 * Centralized Role-Based Route Access Configuration
 * 
 * To add a new page:
 * 1. Add the route key and allowed roles here
 * 2. Add the route in App.tsx wrapped with <ProtectedRoute>
 * 3. Sidebar and route guard handle the rest automatically
 */

export type AppRole = "ADMIN" | "DOCTOR" | "NURSE" | "PHARMACIST" | "WAREHOUSE" | "FRONT_DESK" | "CAMP_ADMIN";

export const routeAccess: Record<string, AppRole[]> = {
  dashboard: ["ADMIN", "DOCTOR", "NURSE", "PHARMACIST", "WAREHOUSE", "FRONT_DESK","CAMP_ADMIN"],
  camps: ["ADMIN"],
  'camp-templates': ["ADMIN","CAMP_ADMIN"],
  'camp-events': ["ADMIN","CAMP_ADMIN"],
  patients: ["ADMIN", "DOCTOR", "NURSE", "FRONT_DESK"],
  encounters: ["DOCTOR", "NURSE","ADMIN"],
  pharmacy: ["PHARMACIST", "ADMIN"],
  stock: ["WAREHOUSE", "ADMIN"],
  suppliers: ["WAREHOUSE", "ADMIN"],
  'supplier-orders': ["WAREHOUSE", "ADMIN"],
  'distribution-orders': ["WAREHOUSE", "ADMIN"],
  doctors: ["ADMIN"],
  reports: ["ADMIN"],
  warehouses: ["ADMIN"],
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

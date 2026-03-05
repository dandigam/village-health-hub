/**
 * Centralized Role-Based Route Access Configuration
 * 
 * To add a new page:
 * 1. Add the route key and allowed roles here
 * 2. Add the route in App.tsx wrapped with <ProtectedRoute>
 * 3. Sidebar and route guard handle the rest automatically
 */

export type AppRole = "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "NURSE" | "PHARMACIST" | "WAREHOUSE" | "FRONT_DESK" | "CAMP_ADMIN";

export const routeAccess: Record<string, AppRole[]> = {
  dashboard: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "NURSE", "PHARMACIST", "WAREHOUSE", "FRONT_DESK", "CAMP_ADMIN"],
  camps: ["SUPER_ADMIN", "ADMIN"],
  'camp-templates': ["SUPER_ADMIN", "ADMIN", "CAMP_ADMIN"],
  'camp-events': ["SUPER_ADMIN", "ADMIN", "CAMP_ADMIN"],
  patients: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "NURSE", "FRONT_DESK"],
  encounters: ["SUPER_ADMIN", "DOCTOR", "NURSE", "ADMIN"],
  pharmacy: ["SUPER_ADMIN", "PHARMACIST", "ADMIN"],
  stock: ["SUPER_ADMIN", "WAREHOUSE", "ADMIN"],
  suppliers: ["SUPER_ADMIN", "WAREHOUSE", "ADMIN"],
  'supplier-orders': ["SUPER_ADMIN", "WAREHOUSE", "ADMIN"],
  'distribution-orders': ["SUPER_ADMIN", "WAREHOUSE", "ADMIN"],
  doctors: ["SUPER_ADMIN", "ADMIN"],
  reports: ["SUPER_ADMIN", "ADMIN"],
  warehouses: ["SUPER_ADMIN", "ADMIN"],
  invoices: ["SUPER_ADMIN", "WAREHOUSE", "ADMIN"],
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

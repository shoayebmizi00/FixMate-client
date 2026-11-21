export function dashboardPathForRole(role?: string | null) {
  if (role === "admin") return "/admin";
  if (role === "technician") return "/technician";
  return "/customer";
}

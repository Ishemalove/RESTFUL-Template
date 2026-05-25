export function calculateChargedAmount(entryDateTime, exitDateTime, feePerHour) {
  const entry = new Date(entryDateTime);
  const exit = new Date(exitDateTime);
  const diffMs = exit - entry;
  if (diffMs <= 0) return feePerHour;
  const hours = Math.ceil(diffMs / (1000 * 60 * 60));
  return Math.max(1, hours) * feePerHour;
}

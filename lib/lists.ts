export function uniqueById<T extends { id: number }>(items: T[]): T[] {
  const seen = new Set<number>();
  const unique: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
  }
  return unique;
}

export function appendUniqueById<T extends { id: number }>(current: T[], incoming: T[]): T[] {
  const seen = new Set(current.map((item) => item.id));
  const next = current.slice();
  for (const item of incoming) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    next.push(item);
  }
  return next;
}

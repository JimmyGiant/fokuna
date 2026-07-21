/** Returns new sortOrder values after moving `itemId` before `beforeId` (or to end). */
export function reorderIds(ids: string[], itemId: string, beforeId: string | null): string[] {
  const without = ids.filter((id) => id !== itemId);
  if (!ids.includes(itemId)) {
    return ids;
  }

  if (beforeId === null) {
    return [...without, itemId];
  }

  const index = without.indexOf(beforeId);
  if (index === -1) {
    return [...without, itemId];
  }

  return [...without.slice(0, index), itemId, ...without.slice(index)];
}

export function applySortOrders<T extends { id: string; sortOrder: number }>(
  items: T[],
  orderedIds: string[],
): T[] {
  const orderMap = new Map(orderedIds.map((id, index) => [id, index]));
  return items
    .map((item) => {
      const next = orderMap.get(item.id);
      return next === undefined ? item : { ...item, sortOrder: next };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

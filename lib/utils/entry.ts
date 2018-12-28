export function getEntryName(entry) {
  return entry.name || entry.concat || entry.src.join(', ');
}

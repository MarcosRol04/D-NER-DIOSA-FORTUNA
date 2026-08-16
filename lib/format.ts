export function formatLei(value: number) {
  return `${value.toFixed(2).replace(/\.00$/, "")} lei`;
}

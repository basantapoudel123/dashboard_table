/** First message per dot-path (e.g. `model`, `dealerPhone`). */
export function zodIssuesToFieldMap(
  issues: readonly { path: readonly unknown[]; message: string }[]
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {}
  for (const issue of issues) {
    const path = issue.path.filter((p): p is string | number => p !== undefined)
    const key = path.map(String).join(".") || "_root"
    if (out[key] == null) {
      out[key] = issue.message
    }
  }
  return out
}

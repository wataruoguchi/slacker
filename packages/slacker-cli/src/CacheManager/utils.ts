/**
 * Sort by key name. It expects each option to be primitive.
 * @param options
 */
export function stringifyOptions(options: object): string {
  return Object.keys(options)
    .sort()
    .map((key) => `${key}=${JSON.stringify(options[key])}`)
    .join("+")
    .replace(/'/g, "")
    .replace(/"/g, "");
}

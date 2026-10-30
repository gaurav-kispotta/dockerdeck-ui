/** Graph identity is separate from the original Compose key and display label. */
export type ResourceKind = 'service' | 'network' | 'volume';
export type RelationshipKind = 'network' | 'volume' | 'depends_on' | 'service-to-service';
export interface ResourceIdentity { kind: ResourceKind; name: string }

export function resourceId(kind: ResourceKind, name: string): string {
  return `${kind}:${encodeURIComponent(name)}`;
}

export function resourcePath(kind: ResourceKind, name: string): string {
  return `${kind}s[${JSON.stringify(name)}]`;
}

export function parseResourceId(id: string): ResourceIdentity | null {
  const match = /^(service|network|volume):(.*)$/.exec(id);
  if (!match) return null;
  try {
    const kind = match[1] as ResourceKind;
    const name = decodeURIComponent(match[2]);
    return resourceId(kind, name) === id ? { kind, name } : null;
  } catch { return null; }
}

/** Escape every tuple component so punctuation cannot make distinct tuples collide. */
export function relationshipId(kind: RelationshipKind, source: string, target: string, detail = ''): string {
  return `edge:${[kind, source, target, detail].map(encodeURIComponent).join(':')}`;
}

export function resourceAstKey(id: string, ast: any): string | null {
  const resource = parseResourceId(id);
  if (!resource || !ast) return null;
  const index = ast[`${resource.kind}s`]?.findIndex((item: { name: string }) => item.name === resource.name) ?? -1;
  return index < 0 ? null : `${resource.kind}-${index}`;
}

export function astKeyResourceId(key: string, ast: any): string | null {
  const match = /^(service|network|volume)-(\d+)(?:-|$)/.exec(key);
  if (!match || !ast) return null;
  const kind = match[1] as ResourceKind;
  const item = ast[`${kind}s`]?.[Number(match[2])];
  return typeof item?.name === 'string' ? resourceId(kind, item.name) : null;
}

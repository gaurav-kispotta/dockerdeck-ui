import type { RelationshipKind } from './resourceIdentity';

export const RELATIONSHIP_KINDS: RelationshipKind[] = ['depends_on', 'network', 'service-to-service', 'volume'];
export type EndpointSymbol = 'triangle' | 'round' | 'diamond' | 'square' | 'none';
export interface RelationshipPresentation {
  kind: RelationshipKind | 'unknown';
  label: string;
  description: string;
  color: string;
  dash?: string;
  double: boolean;
  start: EndpointSymbol;
  end: EndpointSymbol;
}

/** Static Compose relationships; these styles never represent observed traffic. */
export function relationshipPresentation(value: unknown, dark: boolean): RelationshipPresentation {
  switch (value) {
    case 'depends_on': return {
      kind: value, label: 'Dependency', description: 'Dependent service → prerequisite',
      color: dark ? '#FF7A8A' : '#BE2947', dash: '8 5', double: false, start: 'none', end: 'triangle',
    };
    case 'network': return {
      kind: value, label: 'Network membership', description: 'Service belongs to network',
      color: dark ? '#B2A0FF' : '#7050B5', double: false, start: 'round', end: 'round',
    };
    case 'service-to-service': return {
      kind: value, label: 'Shared network', description: 'Inferred connectivity; no observed traffic or direction',
      color: dark ? '#5BC8FF' : '#007796', dash: '10 4 2 4', double: false, start: 'diamond', end: 'diamond',
    };
    case 'volume': return {
      kind: value, label: 'Volume mount', description: 'Service mounts named volume',
      color: dark ? '#F5B454' : '#946000', double: true, start: 'square', end: 'square',
    };
    default: return {
      kind: 'unknown', label: 'Connection', description: 'Unclassified connection',
      color: dark ? '#A8B0BF' : '#5C6577', double: false, start: 'none', end: 'none',
    };
  }
}

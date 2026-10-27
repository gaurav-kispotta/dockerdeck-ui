/**
 * Module-level registry for computed orthogonal routes.
 * Written by RouteComputer (inner ReactFlow component), read by OrthogonalEdge components.
 */

import { Route } from './orthogonalRouter';

const routes = new Map<string, Route>();
const listeners = new Set<() => void>();

export function setRoutes(newRoutes: Map<string, Route>) {
  routes.clear();
  for (const [id, route] of newRoutes) routes.set(id, route);
  listeners.forEach(fn => fn());
}

export function getRoute(id: string): Route | null {
  return routes.get(id) ?? null;
}

export function getAllRoutes(): Map<string, Route> {
  return routes;
}

export function subscribeToRoutes(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

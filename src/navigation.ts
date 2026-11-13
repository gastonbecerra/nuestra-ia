/** En Pages se publica en una subcarpeta sin fallback del servidor. */
export const hashRouting = import.meta.env.MODE === 'pages';

export function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

export function routeHref(route: string) {
  return hashRouting ? `${import.meta.env.BASE_URL}#${route}` : route;
}

export function currentRoute() {
  return hashRouting ? window.location.hash.slice(1) || '/' : window.location.pathname + window.location.search;
}

export function currentSearchParams() {
  return new URL(currentRoute(), window.location.origin).searchParams;
}

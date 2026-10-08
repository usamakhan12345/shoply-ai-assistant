/** The only in-app routes an AI agent action may open. The backend builds routes from its own fixed table
 *  (agents/tools/base.py ROUTES); this is the frontend's independent allow-list, so a bad response can never
 *  navigate to an arbitrary URL, another origin, or a seller/admin page. */
const ALLOWED_ROUTES = [/^\/checkout$/, /^\/cart$/, /^\/orders$/, /^\/orders\/\d+$/, /^\/products\/\d+$/];

export const isAllowedRoute = (route: unknown): route is string =>
  typeof route === 'string' && route.length < 64 && ALLOWED_ROUTES.some((rx) => rx.test(route));

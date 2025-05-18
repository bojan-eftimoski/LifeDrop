import routes from "../data/routes.json";

export function getRoutes() {
  return Promise.resolve(routes);
}

export function getRouteById(id) {
  return Promise.resolve(routes.find((route) => route.id === id));
}

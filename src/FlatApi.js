module.exports = class FlatApi {
  constructor(routes = {}) {
    this.routes = routes;
  }

  getRoutes() {
    const routes = Object.keys(this.routes)
      .filter((key) => this.routes.hasOwnProperty(key))
      .map((key) => [key, this.routes[key]])
      .filter(([key, handler]) => handler instanceof Function);

    return routes
  }
}

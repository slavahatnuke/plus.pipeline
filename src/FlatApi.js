module.exports = class FlatApi {
  constructor(routes = {}) {
    this.routes = routes;
  }

  getRoutes() {
    return Promise.resolve()
      .then(() => {
        const routes = Object.keys(this.routes)
          .filter((key) => this.routes.hasOwnProperty(key))
          .map((key) => [key, this.routes[key]])
          .filter(([key, handler]) => handler instanceof Function);

        return routes
      })
  }
}

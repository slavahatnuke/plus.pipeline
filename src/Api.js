module.exports = class Api {
  constructor(routes = {}) {
    this.routes = routes;
    this.queuePrefix = '';
  }

  getRoutes() {
    return Promise.resolve()
      .then(() => {

        const routes = Object.keys(this.routes)
          .filter((key) => this.routes.hasOwnProperty(key))
          .map((key) => [key, this.routes[key]])
          .filter(([key, handler]) => handler instanceof Function)
          .map(([key, handler]) => {
            const theKey = `${this.queuePrefix}${key}`;

            const theHandler = (data, meta) => {
              return Promise.resolve()
                .then(() => {
                  return handler(data.data, data.route.options, {data}, meta);
                })
            };

            return [theKey, theHandler];
          });

        return routes
      })

  }

  hasRoute(route) {
    return this.routes[route] instanceof Function;
  }

  setQueuePrefix(prefix) {
    this.queuePrefix = prefix;
  }

}

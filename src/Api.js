module.exports = class Api {
  constructor(routes = {}) {
    this.routes = routes;
    this.queuePrefix = '';
    this.nextHandler = () => null;
  }

  getRoutes() {
    return Promise.resolve()
      .then(() => {

        const routes = this._collectRoutes()
          .map(([key, handler]) => {
            const theKey = `${this.queuePrefix}${key}`;

            const theHandler = (data, meta) => {
              return Promise.resolve()
                .then(() => {
                  const context = {data};

                  Object.defineProperty(context, 'refs', {
                    get: () => {
                      const refs = {};

                      (data.parents || []).forEach((parent) => {
                        refs[parent.id] = parent;
                        refs[parent.route] = parent;
                        refs[parent.api] = parent;
                      });

                      return refs;
                    },
                    enumerable: true
                  });

                  Object.defineProperty(context, 'publish', {
                    get: () => (result) => this.nextHandler(result, data, meta),
                    enumerable: true
                  });

                  return handler(data.data, data.route.options, context, meta);
                })
                .then((result) => {
                  return Promise.resolve()
                    .then(() => this.nextHandler(result, data, meta))
                    .then(() => result)
                })
            };

            return [theKey, theHandler];
          });

        return routes
      })

  }

  _collectRoutes() {
    return Object.keys(this.routes)
      .filter((key) => this.routes.hasOwnProperty(key))
      .map((key) => [key, this.routes[key]])
      .filter(([key, handler]) => handler instanceof Function);
  }

  hasRoute(route) {
    return this.routes[route] instanceof Function;
  }

  setQueuePrefix(prefix) {
    this.queuePrefix = prefix;
  }

  setNextHandler(handler) {
    this.nextHandler = handler;
  }

}

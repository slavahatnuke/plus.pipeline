const createId = require('./id');
const Route = require('./Route');

module.exports = class Routing {
  constructor(queue, storage, api, options = {}) {
    this.queue = queue;
    this.storage = storage;
    this.api = api;

    this.options = Object.assign({
      queue_prefix: `api:`
    }, options);

    this.api.setQueuePrefix(this.options.queue_prefix);

    this.api.setNextHandler((result, data, meta) => {
      if (result === undefined) {
        return Promise.resolve(undefined);
      }

      let parents = [];

      if (data.route.history) {
        const parent = {
          id: meta.job.getId(),
          input: data.data,
          output: result,
          route: data.route.id,
          options: data.route.options,
          api: data.route.route,
        };

        parents = Array.from(data.parents);
        parents.push(parent);
      }

      return this.get(data.route.next)
        .then((routes) => {
          return Promise.all(routes.map((route) => {
            return route.add(result, parents);
          }))
        });
    });
  }

  create(route, options = {}, id = null) {
    return Promise.resolve()
      .then(() => this.api.hasRoute(route) || Promise.reject(new Error(`No route: ${route}`)))
      .then(() => id || createId())
      .then((id) => this.save(new Route(id, route, options)))
  }

  get(id) {
    if (Array.isArray(id)) {
      return Promise.all(id.map((id) => this.get(id)));
    }

    return Promise.resolve()
      .then(() => this.storage.get(id))
      .then((data) => data || Promise.reject(new Error(`No route with id: ${id}`)))
      .then((data) => {
        const route = new Route();
        route.setRouting(this);
        route.setData(data);
        return route;
      })
  }

  save(route) {
    if (Array.isArray(route)) {
      return Promise.all(route.map((route) => this.save(route)))
    }

    return Promise.resolve()
      .then(() => {
        route.setRouting(this);

        return this.storage.set(route.getId(), route.getData())
          .then(() => route)
      })
  }

  remove(id) {
    if (Array.isArray(id)) {
      return Promise.all(id.map((id) => this.remove(id)));
    }

    return Promise.resolve()
      .then(() => id instanceof Route ? id.getId() : id)
      .then((id) => this.storage.del(id))
  }

  routeAddToQueue(route, data, parents = []) {
    return Promise.resolve()
      .then(() => this.queue(`${this.options.queue_prefix}${route.getRoute()}`))
      .then((aQueue) => aQueue.add({
        data,
        route: route.getData(),
        parents
      }))
  }


}

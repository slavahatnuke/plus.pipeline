const id = require('./id');
const Route = require('./Route');

module.exports = class Routing {
  constructor(queue, storage, api, options = {}) {
    this.queue = queue;
    this.storage = storage;
    this.api = api;

    this.options = Object.assign({
      queue_prefix: `api:`
    }, options);

    this.api.setQueuePrefix(this.options.queue_prefix)
  }

  create(route, options = {}) {
    return Promise.resolve()
      .then(() => this.api.hasRoute(route) || Promise.reject(new Error(`No route: ${route}`)))
      .then(() => id())
      .then((id) => this.save(new Route(id, route, options)))
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

  routeAddToQueue(route, data) {
    return Promise.resolve()
      .then(() => this.queue(`${this.options.queue_prefix}${route.getRoute()}`))
      .then((aQueue) => aQueue.add({data, route: route.getData()}))
  }


}

module.exports = class Route {
  constructor(id, route, options) {
    this.id = id;

    this.route = route;
    this.options = options instanceof Object ? options : {};

    this.next = [];

    this.routing = null;
  }

  getId() {
    return this.id;
  }

  add(data) {
    return this.routing.routeAddToQueue(this, data);
  }

  setRouting(routing) {
    this.routing = routing;
  }

  pipe(route) {

  }

  getOptions() {
    return this.options;
  }

  getRoute() {
    return this.route;
  }

  getData() {
    return {
      id: this.id,
      route: this.route,
      options: this.options,
      next: this.next
    }
  }
}

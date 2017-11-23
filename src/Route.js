module.exports = class Route {
  constructor(id, route, options) {
    this.id = id || null;

    this.route = route || null;
    this.options = options instanceof Object ? options : {};

    this.next = [];

    this.routing = null;
    this.history = true;
  }

  getId() {
    return this.id;
  }

  add(data, parents = []) {
    return this.routing.routeAddToQueue(this, data, parents);
  }

  setRouting(routing) {
    this.routing = routing;
  }

  pipe(route = null) {
    if (route instanceof Route) {
      this.next.push(route.getId());
      this.next = Array.from(new Set(this.next));
      return route;
    } else if (route === null) {
      this.next = []
    } else {
      throw Error('Unsupported route to pipe');
    }
  }

  unpipe(route = null) {
    if (route instanceof Route) {
      this.next = this.next.filter((id) => route.getId() !== id);
      return route;
    } else if (route === null) {
      this.next = [];
    } else {
      throw Error('Unsupported route to unpipe');
    }
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
      history: this.history,
      next: this.next
    }
  }

  setData(data) {
    this.id = data.id;
    this.route = data.route;

    this.options = data.options;
    this.next = data.next;
    this.history = data.history;
  }

  save() {
    return this.routing.save(this);
  }

  keepHistory(keep = true) {
    this.history = !!keep;
  }
}

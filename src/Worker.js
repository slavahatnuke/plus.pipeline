const {WorkerFactory} = require('plus.queue');

module.exports = class Workers {
  constructor(queue, api, options = {}) {
    this.queue = queue;
    this.api = api;

    this.options = Object.assign({
      api: {}
    }, options);

    this.factory = WorkerFactory(this.options);

    this.workers = [];
    this.subscribers = [];
  }

  start() {
    return this.stop()
      .then(() => this._makeWorkers())
      .then(() => Promise.all(this.workers.map((worker) => worker.start())))
  }

  stop() {
    return Promise.all(this.workers.map((worker) => worker.stop()))
      .then(() => this.workers = [])
  }

  subscribe(onSuccess = () => null, onError = () => null) {
    return Promise.resolve()
      .then(() => {
        this.subscribers.push([onSuccess, onError])
      });
  }

  _makeWorkers() {
    return Promise.resolve()
      .then(() => this.api.getRoutes())
      .then((routes) => {
        if (routes.length === this.workers.length) {
          return this.workers;
        } else {
          return routes
            .map(([name, handler]) => {
              const options = this.options.api && this.options.api[name] instanceof Object ? this.options.api[name] : {};
              return this.factory(this.queue(name), handler, options);
            })
            .map((worker) => {
              this.subscribers.forEach(([onSuccess, onError]) => worker.subscribe(onSuccess, onError))
              return worker;
            });
        }
      })
      .then((workers) => this.workers = workers);
  }

};

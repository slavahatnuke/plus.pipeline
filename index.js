const Pipeline = require('./src/Pipeline');
const Node = require('./src/Node');

const Worker = require('./src/Worker');
const FlatApi = require('./src/FlatApi');

const {QueueFactory} = require('plus.queue');

module.exports = {
  Pipeline: () => new Pipeline(),
  Node: () => new Node(),

  FlatApi: (routes = {}) => new FlatApi(routes),

  Queue: (redis, options = {}) => {
    const cache = {};
    const queueFactory = QueueFactory(redis, options);

    return (name, specificOptions = {}) => {
      cache[name] = cache[name] || queueFactory(name, specificOptions);
      return cache[name];
    }
  },
  Worker: (queue, api, options = {}) => new Worker(queue, api, options)
};

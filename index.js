
const Worker = require('./src/Worker');
const FlatApi = require('./src/FlatApi');
const Api = require('./src/Api');
const RedisStorage = require('./src/RedisStorage');
const Routing = require('./src/Routing');

const {QueueFactory} = require('plus.queue');

module.exports = {
  FlatApi: (routes = {}) => new FlatApi(routes),

  Queue: (redis, options = {}) => {
    const cache = {};
    const queueFactory = QueueFactory(redis, options);

    return (name, specificOptions = {}) => {
      cache[name] = cache[name] || queueFactory(name, specificOptions);
      return cache[name];
    }
  },
  Worker: (queue, api, options = {}) => new Worker(queue, api, options),

  Api: (routes = {}) => new Api(routes),
  RedisStorage: (redis, options = {}) => new RedisStorage(redis, options),
  Routing: (queue, storage, api) => new Routing(queue, storage, api),
};

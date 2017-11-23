const {Queue, Worker, Api, Routing, RedisStorage} = require('./index');

const redis = require('redis');

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
});

const queue = Queue(redisClient);

const api = Api({
  'add/x': (input, {x}) => {
    // console.log(data);
    return input + x
  },
  'add/y': (input, {y}) => {
    // console.log(data);
    return y + input
  }
});

const routing = Routing(queue, RedisStorage(redisClient), api);

Promise.all([
  routing.create('add/x', {x: 1}),
  routing.create('add/y', {y: 'Yaaaaay-'}),
])
  .then(([route1, route2]) => {
    // route1
    //   .pipe(route2);

    route1.add(10);
    route2.add(10);
  });


const worker = Worker(queue, api, {interval: 100});
worker.subscribe((result) => {
  console.log('OK', result)
}, (error) => {
  console.log('ERROR', error)
});

worker.start();
// OK 11
// OK Yaaaaay-10

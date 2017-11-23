const {Queue, Worker, Api, Routing, RedisStorage} = require('./index');

const redis = require('redis');

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
});

const queue = Queue(redisClient);

const api = Api({
  'add/x': (input, {x}, {refs}) => {
    console.log('>>> 1', refs)
    return input + x
  },
  'add/y': (input, {y}, {refs}) => {
    console.log('>>> 2', refs)

    // console.log('>>>>>', data)
    // console.log('>>>>> refs', data.refs)
    return y + input
  }
});

const routing = Routing(queue, RedisStorage(redisClient), api);

Promise.all([
  routing.create('add/x', {x: 1}),
  routing.create('add/y', {y: 'Yaaaaay-'}),
  routing.create('add/y', {y: '-arrr-'}),
])
  .then(([route1, route2, route3]) => {

    route1
      .pipe(route2)
      .pipe(route3);

    route2.keepHistory(false);

    return routing.save([route1, route2, route3])
    // .then(() => Promise.all([route1, route2].map((route) => route.save())))
      .then(() => {
        route1.add(10);
      });

  });


const worker = Worker(queue, api, {interval: 100});
worker.subscribe((result) => {
  console.log('OK', result)
}, (error) => {
  console.log('ERROR', error)
});

worker.start();

setTimeout(() => worker.stop().then(() => process.exit(0)), 3e3)
// OK 11
// OK Yaaaaay-10

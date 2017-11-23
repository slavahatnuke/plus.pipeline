const {Queue, Worker, Api, Routing, RedisStorage} = require('./index');

const redis = require('redis');

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
});

const queue = Queue(redisClient);

const api = Api({
  'add/x': (input, {x}, {refs, publish}) => {
    return input + x
  },
  'add/y': (input, {y}, {refs}) => {
    return y + input
  },
  'add/reverse': (input) => [input, input.split('').reverse().join('')],
  'map': (input, {mapping, separator}, {refs, publish}) => {

    input = Array.isArray(input) ? input : [input];

    const {map} = require('ogs');

    const theMap = map(mapping || {}, separator || '.');

    const results = input.map((input) => {
      return theMap({
        input,
        refs
      })
    });

    if (results.length == 1) {
      return results[0];
    } else {
      return Promise.resolve()
        .then(() => {
          return Promise.all(results.map((result) => {
            return publish(result);
          }))
        })
        .then(() => undefined)
    }
  },
  'log': (input, options, data) => {
    // console.log('>>> data', data);
    // console.log('>>> data', require('util').inspect(data, {depth: null}));
    console.log(input)
  }
});

const routing = Routing(queue, RedisStorage(redisClient), api);

Promise.all([
  routing.create('add/x', {x: 1}, 'add/one'),
  routing.create('add/y', {y: 'Yaaaaay-'}, 'add/yay'),
  routing.create('add/y', {y: '-arrr-'}, 'add/arr'),
  routing.create('add/reverse', null, 'add/reverse'),
  routing.create('log', null, 'log'),

  routing.create('map', {
    mapping: {
      'input': 'input',
      'source0': 'refs.add/one.input',
      'source1': 'refs.add/yay.input',
      'source2': 'refs.add/arr.input',
      'revers': 'refs.add/reverse.output'
    }
  }, 'map/1'),
])
  .then(([route1, route2, route3, route4, log, map]) => {

    route1
      .pipe(route2)
      .pipe(route3)
      .pipe(route4)
      .pipe(map)
      .pipe(log);

    // route1.unpipe();

    // route2.keepHistory(false);

    return routing.save([route1, route2, route3, route4, map, log])
    // .then(() => Promise.all([route1, route2].map((route) => route.save())))
      .then(() => {
        route1.add(10);

        // Array(10000).fill(0).map((it, idx) => {
        //   route1.add(10 + idx);
        // })
      });

  });


const worker = Worker(queue, api, {interval: 10});
worker.subscribe((result) => {
  if(result !== undefined) {
    console.log('OK', result)
  }
}, (error) => {
  console.log('ERROR', error)
});

worker.start();

setTimeout(() => {
  // routing.remove(['add/one', 'add/arr']);
  worker.stop().then(() => process.exit(0))
}, 3e3)
// OK 11
// OK Yaaaaay-10

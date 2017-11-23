const {Queue, Worker, FlatApi} = require('./index');

const redis = require('redis');

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
});

const queue = Queue(redisClient);
queue('add/1').add(10);
queue('add/1').add(20);

queue('add/2').add(50);
queue('add/2').add(60);

const api = FlatApi({
  'add/1': (data) => {
    // console.log(data);
    return data + 1
  },
  'add/2': (data) => {
    // console.log(data);
    return data + 2;
  },
});

const worker = Worker(queue, api);
worker.subscribe((result) => console.log(result));
worker.start();
// 11
// 52
// 21
// 62

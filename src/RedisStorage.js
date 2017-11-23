module.exports = class RedisStorage {
  constructor(redis, options = {}) {
    this.redis = redis;

    this.options = Object.assign({
      prefix: 'redis-storage:'
    }, options);
  }

  get(id) {
    return Promise.resolve()
      .then(() => {
        const key = this._getKey(id);

        return new Promise((resolve, reject) => this.redis.get(key,
          (err, result) => err ? reject(err) : resolve(result)))
      })
      .then((value) => JSON.parse(value))
  }

  set(id, value) {
    return Promise.resolve()
      .then(() => {
        const key = this._getKey(id);
        const val = JSON.stringify(value);

        return new Promise((resolve, reject) => this.redis.set(key, val,
          (err, result) => err ? reject(err) : resolve(result)))
      });
  }

  del(id) {
    return Promise.resolve()
      .then(() => {
        const key = this._getKey(id);

        return new Promise((resolve, reject) => this.redis.del(key,
          (err, result) => err ? reject(err) : resolve(result)))
      })
  }

  _getKey(id) {
    return `${this.options.prefix}${id}`;
  }

}

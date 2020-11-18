const cache = {}

module.exports = {
  getItem (id) {
    return cache[id]
  },
  setItem (id, data) {
    cache[id] = data
  }
}
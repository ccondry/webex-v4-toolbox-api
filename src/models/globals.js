const db = require('./db')

// globals cache - these values all come from toolbox.globals in mongo db
const cache = {}

// gets global value from database
async function refresh () {
  // update cache
  try {
    const globals = await db.find('toolbox', 'globals', {})
    for (const global of globals) {
      cache[global.name] = global.value
    }
  } catch (e) {
    console.log('error updating globals cache:', e.message)
  }
}

// prime the cache now:
const initialLoad = refresh()

// update cache values every 5 minutes
const throttle = 1000 * 60 * 5
setInterval(refresh, throttle)

function get (name) {
  return cache[name]
}

async function set (name, value) {
  try {
    const existing = await db.findOne('toolbox', 'globals', {name})
    if (existing) {
      // update existing global
      const updates = {$set: {}}
      updates.$set[name] = value
      await db.updateOne('toolbox', 'globals', {name}, updates)
    } else {
      // insert new global
      await db.insertOne('toolbox', 'globals', {name, value})
    }
    // set in cache
    cache[name] = value
  } catch (e) {
    throw e
  }
}
// export our specific cache value methods and the generic getCache method
module.exports = {
  refresh,
  initialLoad,
  get,
  set
}
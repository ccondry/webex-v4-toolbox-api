const db = require('./db')

// globals cache - these values all come from toolbox.globals in mongo db
const cache = {}

// gets global value from database
async function getGlobal (name) {
  const query = {name}
  return db.findOne('toolbox', 'globals', query)
}

// get a value from cache. if not found in cache, try to find it in the database
function getCache (name) {
  return new Promise((resolve, reject) => {
    if (cache[name]) {
      resolve(cache[name])
    } else {
      // cache miss - get from database
      getGlobal(name)
      .then(r => {
        if (r) {
          resolve(r.value)
          // set cache
          cache[name] = r.value
        } else {
          reject(`could not find ${name} in toolbox.globals`)
        }
      })
      .catch(e => {
        reject(`failed to find ${name} in toolbox.globals: ${e.message}`)
      })
    }
  })
}

// get production or development Teams room ID for logging
function getRoomId () {
  if (process.env.NODE_ENV === 'production') {
    return getCache('productionLogRoomId')
  } else {
    return getCache('developmentLogRoomId')
  }
}

// gets the toolbot bearer token for logging to Temas
function getBotToken () {
  return getCache('toolbotToken')
}

// gets the control hub refresh token for provision/deprovision Webex CC users
function getRefreshToken () {
  return getCache('webexV4RefreshToken')
}

// prime the cache now:
// get room ID into cache now
getRoomId()
// get bot token into cache now
getBotToken()
// get control hub refresh token into cache now
getRefreshToken()

// update cache values every 5 minutes
const throttle = 1000 * 60 * 5
setInterval(getRoomId, throttle)
setInterval(getBotToken, throttle)
setInterval(getRefreshToken, throttle)

// export our specific cache value methods and the generic getCache method
module.exports = {
  getCache,
  getRoomId,
  getBotToken,
  getRefreshToken
}
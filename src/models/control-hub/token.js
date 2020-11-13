const fetch = require('../fetch')
const teamsLogger = require('../teams-logger')
const cache = require('../cache')
const globals = require('../globals')

// refresh access token in cache
async function refresh () {
  try {
    // get new access token using the refresh token
    const token = await get()
    // store new access token in cache
    cache.setItem('accessToken', token)
  } catch (e) {
		// call for help - this must be manually fixed
    const message = 'help! my refresh token expired!'
    console.log(message)
    teamsLogger.log(message)
  }
}

// get a new access token from webex, using the refresh token from database
async function get () {
	const url = 'https://api.ciscospark.com/v1/access_token'
	try {
		// get refresh token from cache/database
		const refreshToken = await globals.getRefreshToken()
		const urlencoded = new URLSearchParams()
		urlencoded.append('grant_type', 'refresh_token')
		// client ID and secret are in .env file. hopefully they don't change often.
		urlencoded.append('client_id', process.env.CLIENT_ID)
		urlencoded.append('client_secret', process.env.CLIENT_SECRET)
		urlencoded.append('refresh_token', refreshToken)

		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: urlencoded.toString(),
			redirect: 'follow'
		}
		
		// get the refresh token now
		const response = await fetch(url, options)
		// TODO remove this debug log
		console.log(response)
		// return just the access_token part
		return response.access_token
	} catch (e) {
		// rethrow all errors
		throw e
	}	
}

// get access token once now
refresh()

// and get access token again every 7 days
const throttle = 7 * 24 * 60 * 60 * 1000
setInterval(function () {
	refresh()
}, throttle)

// expose get and refresh methods
module.exports = {
  get,
  refresh
}

const fetch = require('../fetch')
const teamsLogger = require('../teams-logger')
const globals = require('../globals')

// refresh access token in cache
async function refresh () {
  try {
    // get new access token using the refresh token
		const token = await get()
		// console.log('full token:', token)
    // store new access token in cache
		globals.set('webexV4ControlHubAccessToken', token.access_token, token.expires_in)
		return token.access_token
  } catch (e) {
		if (e.status === 401) {
			// call for help - this must be manually fixed
			const message = 'help! my refresh token expired!'
			console.log(message)
			teamsLogger.log(message)
		} else {
			console.log('failed to refresh access token:', e.message)
		}
  }
}

// get a new access token from webex, using the refresh token from database
async function get () {
	const url = 'https://api.ciscospark.com/v1/access_token'
	try {
		// get refresh token from cache/database
		await globals.initialLoad
		const refreshToken = globals.get('webexV4RefreshToken')
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
		
		// return entire token object
		return fetch(url, options)
	} catch (e) {
		// rethrow all errors
		throw e
	}	
}

// get access token once now
refresh()

// and get access token again every 7 days
// const throttle = 7 * 24 * 60 * 60 * 1000
// and get access token again every 1 minute
const throttle = 1 * 60 * 1000
setInterval(function () {
	refresh()
}, throttle)

// expose get and refresh methods
module.exports = {
  get,
  refresh
}

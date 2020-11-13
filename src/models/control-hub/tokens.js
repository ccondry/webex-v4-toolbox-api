const fetch = require('./fetch')

// refresh access token in cache
async function refresh () {
  try {
    // get new access token using the refresh token
    const token = await bearerToken.getToken()
    // store new access token in cache
    localStorage.setItem('acToken', token)
  } catch (e) {
    const message = 'help! my refresh token expired!'
    console.log(message)
    teamsLogger.send(message)
  }
}

async function get() {
	const url = 'https://api.ciscospark.com/v1/access_token'
	try {
		const urlencoded = new URLSearchParams()
		urlencoded.append('grant_type', 'refresh_token')
		urlencoded.append('client_id', process.env.CLIENT_ID)
		urlencoded.append('client_secret', process.env.CLIENT_SECRET)
		// TODO get this from database
		urlencoded.append('refresh_token', process.env.REFRESH_TOKEN)

		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: urlencoded.toString(),
			redirect: 'follow'
		}
	
		const response = await fetch(url, options)
		return response.access_token
	} catch (e) {
		// rethrow all errors
		throw e
	}	
}

// Export
module.exports = {
  get,
  refresh
}




module.exports = {
  refresh
}

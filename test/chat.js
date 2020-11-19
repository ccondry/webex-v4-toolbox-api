require('dotenv').config()
const fetch = require('../src/models/fetch')
const token = require('../src/models/control-hub/token')

const url = `https://cmm.produs1.ciscoccservice.com/cmm/v1/organization/${process.env.ORG_ID}/template`

async function main () {
  try {
    const t = await token.get()
    const options = {
      headers: {
        Authorization: `Bearer ${t}`
      },
      query: {
        mediaType: 'chat'
      }
    }
    const response = await fetch(url, options)
    return response
  } catch (e) {
    throw e 
  }
}

main()
.then(r => console.log('success', r))
.catch(e => console.log('error', e))
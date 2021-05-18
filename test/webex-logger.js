require('dotenv').config()
const logger = require('../src/models/teams-logger')

async function main () {
  try {
    await logger.debug('debug?')
    await logger.log('info.')
    await logger.warn('warning!')
    await logger.error('error!!!')
  } catch (e) {
    throw e 
  }
}

main()
.then(r => console.log('success', r))
.catch(e => console.log('error', e))
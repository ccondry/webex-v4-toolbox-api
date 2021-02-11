require('dotenv').config()
const lib = require('../src/models/cjp/routing-strategy/global-email')

lib.provision('1234', '16529')
.then(r => console.log('done'))
.catch(e => console.log('error', e))
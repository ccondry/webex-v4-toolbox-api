require('dotenv').config()
const deprovision = require('../src/models/deprovision')

deprovision('0609')
.then(r => console.log(r))
.catch(e => console.log(e))
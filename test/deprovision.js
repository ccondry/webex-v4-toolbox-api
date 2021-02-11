require('dotenv').config()
const deprovision = require('../src/models/deprovision')

deprovision('1234')
.then(r => console.log(r))
.catch(e => console.log(e))
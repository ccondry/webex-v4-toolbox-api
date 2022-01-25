require('dotenv').config()
const deprovision = require('../src/models/deprovision')

deprovision({id: '0325', email: 'ccondry@cisco.com'})
.then(r => console.log(r))
.catch(e => console.log(e))
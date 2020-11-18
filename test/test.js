require('dotenv').config()
const client = require('../src/models/cjp/client')

client.routingStrategy.list()
.then(strategies => {
  const data = strategies.auxiliaryDataList
  .filter(v => v.attributes.name__s.includes('0325'))
  .map(v => {
    return {
      id: v.id,
      name: v.attributes.name__s,
      parent: v.attributes.parentStrategyId__s
    }
  })

  console.log(data)
  process.exit(0)
})
.catch(e => console.log(e))


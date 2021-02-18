const cjpClient = require('../../cjp/client')
// wrapper to translate the `await cjp.get()` call
const cjp = {
  async get () {
    return cjpClient
  }
}
// Delete Routing Strategies
async function deleteRS (name) {
  try {
    const client = await cjp.get()
    const strategies = await client.routingStrategy.list()
    const strategiesToDelete = strategies.auxiliaryDataList.filter(v => {
      return v.attributes.name__s === name
    })
    for (const strategy of strategiesToDelete) {
      try {
        await client.routingStrategy.delete(strategy.id)
        console.log(`successfully deleted routing strategy ${strategy.attributes.name__s} (${strategy.id})`)
      } catch (e) {
        console.log(`failed to delete routing strategy ${strategy.attributes.name__s} (${strategy.id})`)
      }
    }
  } catch (e) {
    throw e
  }
}

module.exports = {
  delete: deleteRS,
  globalEmail: require('./global-email')
}
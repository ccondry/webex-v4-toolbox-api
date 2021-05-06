require('dotenv').config()
const client = require('../src/models/cjp/client')

async function main () {
  try {
    const response = await client.team.list()
    const teams = response.auxiliaryDataList
    const myTeam = teams.find(v => v.attributes.name__s === 'T_dCloud_0325')
    const currentLayout = myTeam.attributes.desktopLayoutId__s

    await client.desk
  } catch (e) {
    throw e 
  }
}

main()
.then(r => console.log('success', r))
.catch(e => console.log('error', e))
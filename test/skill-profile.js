require('dotenv').config()
const cjp = require('../src/models/cjp')

async function main () {
  try {
    return await cjp.skillProfile.list()
  } catch (e) {
    throw e
  }
}

// go
main()
.then(r => {
  const skills = r.map(v => {
    return {
      id: v.id,
      name: v.attributes.name__s,
      data: JSON.parse(v.attributes.profileData__s)
    }
  })
  console.log('done:', JSON.stringify(skills, null, 2))
})
.catch(e => {
  console.log('error', e.message)
})
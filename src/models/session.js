const fetch = require('./fetch')
const demoVersionTag = require('./demo-version-tag')

async function getDemo () {
  const url = `https://mm.cxdemo.net/api/v1/demo`
  const options = {
    query: {
      demo: 'webex',
      version: demoVersionTag,
      instant: true
    }
  }
  const demos = await fetch(url, options)
  // there should be only 1
  const demo = demos[0]
  return demo
}

async function provision (token) {
  // send POST to dCloud session reverse proxy to start provision
  const demo = await getDemo()
  const url = `https://${demo.rp}/api/v1/cwcc/provision`
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
  await fetch(url, options)
}

module.exports = {
  provision
}
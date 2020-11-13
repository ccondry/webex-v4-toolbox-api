const Client = require('cwcc-provision-client')

const client = new Client({
  fromAddress: process.env.CJP_FROM_ADDRESS,
  apiKey: process.env.CJP_API_KEY,
	tenantId: process.env.CJP_TENANT_ID,
	baseUrl: process.env.CJP_BASE_URL
})

module.exports = client
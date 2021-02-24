const crypto = require('crypto')

// create hash of user sub, and append it to the first 8 characters of the user sub
function getHash (sub) {
  // for cisco.com email addresses, just use the part before the @
  const parts = sub.split('@')
  if (parts[1] === 'cisco.com') {
    return parts[0]
  }
  // for all other non-cisco users, generate a hash based on their email
  const hash = crypto
  .createHash('shake128', {outputLength: 6})
  .update(sub, 'utf-8')
  .digest('base64')
  .replace('+', '')
  return sub.split('@').shift().slice(0, 8) + hash
}

module.exports = getHash
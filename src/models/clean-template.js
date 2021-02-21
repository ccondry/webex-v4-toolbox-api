// return a clean copy of a template JSON that can be modified and use for
// POST or PUT operations
function cleanTemplate (template) {
  const copy = JSON.parse(JSON.stringify(template))
  
  // move timestamps to properly-named attributes, and update to current time
  const now = new Date().getTime()
  copy.attributes._lmts__l = now
  copy.attributes.cstts__l = now
  delete copy.attributes.cstts
  
  // move tenant ID to properly-named attribute
  copy.attributes.tid__s = copy.attributes.tid
  delete copy.attributes.tid

  // remove template's original IDs
  delete copy.id
  delete copy.attributes.sid

  // remove db ID as it will be generated
  delete copy.attributes.dbId__l

  return copy  
}

module.exports = cleanTemplate
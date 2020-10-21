const admins = [
  'ccondry'
]

module.exports = function (user) {
  return admins.includes(user.sub)
}
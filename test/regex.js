const message = '0000052D: SvcErr: DSID-031A12D2, problem 5003 (WILL_NOT_PERFORM), data 0'
// const ldapPasswordError = /DSID-031A12D2/
const ldapPasswordError = /GGGGG/
// console.log(message.match(ldapPasswordError))
// console.log(message.test(ldapPasswordError))
console.log(ldapPasswordError.test(message))
// generate a random hour of the day for script start. this fixes
// CCBU db query/logging issue when many current routing strategies are
// generated at the same time
const randomHour = Math.floor(Math.random() * 24)
const randomTime = randomHour * 60 * 60 * 1000
console.log(String(randomTime))
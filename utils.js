var fs = require('fs');

exports.formatNow = () =>
  (new Date()).toISOString().replace(/[.:-]/g, "")

exports.getParticipants = () =>
  JSON.parse(fs.readFileSync('./data/participants.json', 'utf-8'))

exports.isDate = (date) =>
  /\d\d\d\d-\d\d-\d\d/.test(date) && !isNaN(Date.parse(date))
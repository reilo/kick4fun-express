var fs = require('fs');

exports.formatNow = () =>
  (new Date()).toISOString().replace(/[.:-]/g, "")

exports.isDate = (date) =>
  /\d\d\d\d-\d\d-\d\d/.test(date) && !isNaN(Date.parse(date))

exports.getParticipants = () =>
  JSON.parse(fs.readFileSync('./data/participants.json', 'utf-8'))

exports.getTournament = (id) => {
  var filePath = './data/tournaments/' + id + ".json";
  var data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

exports.writeTournament = (id, json) => {
  var filePath = './data/tournaments/' + id + ".json";
  fs.writeFileSync(filePath, JSON.stringify(json), 'utf-8');
}

exports.backupTournament = (id) => {
  var filePath = './data/tournaments/' + id + ".json";
  var filePathBak = './data/tournaments/bak/' + id + "_" + utils.formatNow() + ".json";
  fs.createReadStream(filePath).pipe(fs.createWriteStream(filePathBak));
}

exports.shuffle = (array) => {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

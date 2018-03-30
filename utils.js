var fs = require('fs');
var appConfig = require('./appConfig');

exports.formatNow = () =>
  (new Date()).toISOString().replace(/[.:-]/g, "")

exports.isDate = (date) =>
  /\d\d\d\d-\d\d-\d\d/.test(date) && !isNaN(Date.parse(date))

exports.getLigaStatus = () => {
  let json = JSON.parse(
    fs.readFileSync(appConfig.dataPath + "ligastatus.json", 'utf-8'));
  return json;
}

exports.getParticipants = () =>
  JSON.parse(fs.readFileSync(appConfig.dataPath + 'participants.json', 'utf-8'))

exports.getTournament = (id) => {
  var filePath = appConfig.dataPath + 'tournaments/' + id + ".json";
  var data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

exports.writeTournament = (id, json) => {
  var filePath = appConfig.dataPath + 'tournaments/' + id + ".json";
  fs.writeFileSync(filePath, JSON.stringify(json), 'utf-8');
}

exports.backupTournament = (id) => {
  var filePath = appConfig.dataPath + 'tournaments/' + id + ".json";
  var filePathBak = appConfig.dataPath + 'tournaments/bak/' + id + "_" + exports.formatNow() + ".json";
  fs.createReadStream(filePath).pipe(fs.createWriteStream(filePathBak));
}

exports.backupPlayers = () => {
  var filePath = appConfig.dataPath + "participants.json";
  var filePathBak = appConfig.dataPath + 'bak/participants' + "_" + exports.formatNow() + ".json";
  fs.createReadStream(filePath).pipe(fs.createWriteStream(filePathBak));
}

exports.getTemplateConfig = () =>
  JSON.parse(fs.readFileSync(appConfig.dataPath + 'templates/templateConfig.json', 'utf-8'));

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

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
  JSON.parse(fs.readFileSync(
    appConfig.dataPath + 'participants.json', 'utf-8'))

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
  var backupFolder = appConfig.dataPath + 'tournaments/bak/';
  !fs.existsSync(backupFolder) && fs.mkdirSync(backupFolder);
  var backupFilePath = backupFolder + id + "_" + exports.formatNow() + ".json";
  fs.createReadStream(filePath).pipe(fs.createWriteStream(backupFilePath));
}

exports.writePlayers = (json) => {
  var filePath = appConfig.dataPath + "participants.json";
  fs.writeFileSync(filePath, JSON.stringify(json), 'utf-8');
}

exports.backupPlayers = () => {
  var filePath = appConfig.dataPath + "participants.json";
  var backupFolder = appConfig.dataPath + 'bak/';
  !fs.existsSync(backupFolder) && fs.mkdirSync(backupFolder);
  var backupFilePath = backupFolder + 'participants' + "_" +
    exports.formatNow() + ".json";
  fs.createReadStream(filePath).pipe(fs.createWriteStream(backupFilePath));
}

exports.getTemplateConfig = () =>
  JSON.parse(fs.readFileSync(
    appConfig.dataPath + 'templates/templateConfig.json', 'utf-8'));

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

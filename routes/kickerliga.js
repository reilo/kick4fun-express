var fs = require('fs');

exports.get = function (request, response, next) {
  var filePath = "./data/ligastatus.json";
  var data = fs.readFileSync(filePath, 'utf-8');
  var json = JSON.parse(data);
  var rulesFilePath = "./data/rules.json";
  data = fs.readFileSync(rulesFilePath, 'utf-8');
  var rules = JSON.parse(data);
  json.rules = rules.liga;
  response.status(200).send(json);
};

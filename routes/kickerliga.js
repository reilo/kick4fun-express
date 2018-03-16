var fs = require('fs');

exports.get = function (request, response, next) {
  var filePath = "./data/ligastatus.json";
  var data = fs.readFileSync(filePath, 'utf-8');
  var json = JSON.parse(data);
  response.status(200).send(json);
};

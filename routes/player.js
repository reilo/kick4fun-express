var fs = require('fs');

exports.list = function (request, response, next) {
  var filePath = './data/participants.json';
  var data = fs.readFileSync(filePath, 'utf-8');
  var json = JSON.parse(data);
  response.status(200).send(json);
};
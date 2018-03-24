var fs = require('fs');
var utils = require('../utils');

exports.update = function (request, response, next) {
  var tid = request.params.tid;
  var rid = request.params.rid;
  var body = request.body;
  var startDate = body.startDate;
  var endDate = body.endDate;
  var filePath = './data/tournaments/' + tid + ".json";
  var filePathBak = './data/tournaments/bak/' + tid + "_" + utils.formatNow() + ".json";
  var data = fs.readFileSync(filePath, 'utf-8');
  var json = JSON.parse(data);
  if (body.password != json.password) {
    response.statusMessage = "Ungültiges Password";
    response.status(401).end();
  } else if (!utils.isDate(startDate) || !utils.isDate(endDate)) {
    response.statusMessage = "Ungültiges Datumsformat";
    response.status(400).end();
  } else {
    json.backup && fs.writeFileSync(filePathBak, data, 'utf-8');
    Object.assign(json.rounds[rid], { startDate: startDate, endDate: endDate });
    fs.writeFileSync(filePath, JSON.stringify(json), 'utf-8');
    response.status(200).send(json);
  }
};
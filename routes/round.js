var fs = require('fs');

exports.update = function (request, response, next) {
  var tid = request.params.tid;
  var rid = request.params.rid;
  var body = request.body;
  var filePath = './data/tournaments/' + tid + ".json";
  var filePathBak = './data/tournaments/bak/' + tid + "_" + Date.now().toString() + ".json";
  var data = fs.readFileSync(filePath, 'utf-8');
  fs.writeFileSync(filePathBak, data, 'utf-8');
  var json = JSON.parse(data);
  Object.assign(json.rounds[rid], { startDate: body.startDate, endDate: body.endDate });
  fs.writeFileSync(filePath, JSON.stringify(json), 'utf-8');
  response.status(200).send(json);
};
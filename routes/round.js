var fs = require('fs');

exports.update = function (request, response, next) {
  var tid = request.params.tid;
  var rid = request.params.rid;
  var body = request.body;
  var startDate = body.startDate;
  var endDate = body.endDate;
  var filePath = './data/tournaments/' + tid + ".json";
  var filePathBak = './data/tournaments/bak/' + tid + "_" + Date.now().toString() + ".json";
  var data = fs.readFileSync(filePath, 'utf-8');
  var json = JSON.parse(data);
  if (body.password != json.password) {
    response.sendStatus(401);
  } else if (!/\d\d\d\d-\d\d-\d\d/.test(startDate) || isNaN(Date.parse(startDate))) {
    response.sendStatus(400);
  } else if (!/\d\d\d\d-\d\d-\d\d/.test(endDate) || isNaN(Date.parse(endDate))) {
    response.sendStatus(400);
  } else {
    fs.writeFileSync(filePathBak, data, 'utf-8');
    Object.assign(json.rounds[rid], { startDate: startDate, endDate: endDate });
    fs.writeFileSync(filePath, JSON.stringify(json), 'utf-8');
    response.status(200).send(json);
  }
};
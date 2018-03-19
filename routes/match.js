var fs = require('fs');

exports.update = function (request, response, next) {
  var tid = request.params.tid;
  var rid = parseInt(request.params.rid);
  var mid = parseInt(request.params.mid);
  var body = request.body;
  var filePath = './data/tournaments/' + tid + ".json";
  var filePathBak = './data/tournaments/bak/' + tid + "_" + Date.now().toString() + ".json";
  var data = fs.readFileSync(filePath, 'utf-8');
  var json = JSON.parse(data);
  if (body.password === json.password) {
    fs.writeFileSync(filePathBak, data, 'utf-8');
    Object.assign(json.rounds[rid].matches[mid], { date: body.date, sets: body.sets });
    fs.writeFileSync(filePath, JSON.stringify(json), 'utf-8');
    response.sendStatus(200);
  } else {
    response.sendStatus(401);
  }
};

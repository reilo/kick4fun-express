var fs = require('fs');

exports.update = function (request, response, next) {
  var tid = request.params.tid;
  var rid = parseInt(request.params.rid);
  var mid = parseInt(request.params.mid);
  var body = request.body;
  var date = body.date;
  var sets = body.sets;
  var filePath = './data/tournaments/' + tid + ".json";
  var filePathBak = './data/tournaments/bak/' + tid + "_" + Date.now().toString() + ".json";
  var data = fs.readFileSync(filePath, 'utf-8');
  var json = JSON.parse(data);
  var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  if (body.password != json.password) {
    response.sendStatus(401);
  } else if (!/\d\d\d\d-\d\d-\d\d/.test(date) || isNaN(Date.parse(date))) {
    response.sendStatus(400);
  } else if (sets.length != 3 ||
    !sets.reduce((res, set) => res && set.length == 2, true)) {
    response.sendStatus(400);
  } else if (!sets.reduce((res, set) => res && set.reduce((res2, goals) =>
    res2 && numbers.indexOf(goals) > -1, true), true)) {
    response.sendStatus(400);
  } else {
    fs.writeFileSync(filePathBak, data, 'utf-8');
    Object.assign(json.rounds[rid].matches[mid], { date: date, sets: sets });
    fs.writeFileSync(filePath, JSON.stringify(json), 'utf-8');
    response.status(200).send(json);
  }
};

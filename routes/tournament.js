var fs = require('fs');

exports.get = function (request, response, next) {
  var tid = request.params.id;
  var filePath = './data/tournaments/' + tid + ".json";
  var data = fs.readFileSync(filePath, 'utf-8');
  var json = JSON.parse(data);
  json.id = tid;
  var table = calculateTable(json);
  json.table = table;
  response.status(200).send(json);
};

exports.list = function (request, response, next) {
  var dirPath = './data/tournaments/';
  var files = fs.readdirSync(dirPath);
  var tournaments = files.reduce((res, cur) => {
    var idx = cur.indexOf(".json", cur.length - 5);
    if (idx !== -1) {
      var id = cur.substr(0, idx);
      var data = fs.readFileSync(dirPath + cur, 'utf-8');
      var json = JSON.parse(data);
      let item = {
        id: id,
        name: json.name,
        type: json.type,
        createdBy: json.createdBy,
        official: json.official,
        status: json.status,
        completedDate: json.completedDate
      };
      const table = calculateTable(json);
      table && table.length && Object.assign(item, {
        ranking: table.reduce((res, cur, index) => {
          index < 3 && res.push(cur.player);
          return res;
        }, [])
      });
      res.push(item);
    }
    return res;
  }, []);
  response.status(200).send(tournaments);
};

function calculateTable(data) {
  var template = { "matches": 0, "wins": 0, "score": 0, "goalsScored": 0, "goalsShipped": 0 };
  var table = []
  if (!data.participants) return table;
  var map = data.participants.reduce((obj, cur) => {
    obj[cur] = Object.assign({}, template);
    return obj;
  }, {});
  data.rounds.forEach(round => {
    round.matches.forEach(match => {
      if (match.sets && match.sets.length) {
        var numSets = match.sets.length;
        var result1 = match.sets.reduce((res, cur) => {
          res[0] += cur[0] > cur[1] ? 1 : 0;
          res[1] += cur[0];
          res[2] += cur[1];
          return res;
        }, [0, 0, 0]);
        match.player[0].forEach(player => {
          map[player].matches += 1;
          map[player].wins += result1[0] > numSets / 2;
          switch (data.counting) {
            case 'liga-1':
              map[player].score += result1[0] > numSets / 2;
              break;
            case 'liga-2':
            default:
              map[player].score += result1[0];
              break;
          }
          map[player].goalsScored += result1[1];
          map[player].goalsShipped += result1[2];
        });
        var result2 = match.sets.reduce((res, cur) => {
          res[0] += cur[1] > cur[0] ? 1 : 0;
          res[1] += cur[1];
          res[2] += cur[0];
          return res;
        }, [0, 0, 0]);
        match.player[1].forEach(player => {
          map[player].matches += 1;
          map[player].wins += result2[0] > numSets / 2;
          switch (data.counting) {
            case "liga-1":
              map[player].score += result2[0] > numSets / 2;
              break;
            case "liga-2":
            default:
              map[player].score += result2[0];
              break;
          }
          map[player].goalsScored += result2[1];
          map[player].goalsShipped += result2[2];
        });
        match.result = [result1[0], result2[0]];
      }
    })
  });
  for (var key in map) {
    table.push(Object.assign(map[key], { player: key }));
  }
  table.sort((a, b) => {
    var diff = a.score - b.score;
    if (!diff) {
      diff = (a.goalsScored - a.goalsShipped) - (b.goalsScored - b.goalsShipped);
      if (!diff) {
        diff = a.goalsScored - b.goalsScored;
      }
    }
    return -diff;
  });
  return table;
}

exports.update = function (request, response, next) {
  var tid = request.params.id;
  var filePath = './data/tournaments/' + tid + ".json";
  var data = fs.readFileSync(filePath, 'utf-8');
  var json = JSON.parse(data);
  //...
  response.status(200).send(json);
};

exports.create = function (request, response, next) {
  var body = request.body;
  var tid = body.id;
  var tournament = Object.assign({}, {
    createdBy: body.createdBy,
    name: body.name,
    type: "liga",
    counting: "liga-2",
    official: body.official,
    status: "progress",
    password: body.password,
    participants: body.participants
  });
  var templateConfigPath = './data/templates/templateConfig.json';
  var templateConfigData = fs.readFileSync(templateConfigPath, 'utf-8');
  var jsonTemplateConfig = JSON.parse(templateConfigData);
  var templateConfigEntry = jsonTemplateConfig.find(template => template.id === body.template);
  var templatePath = './data/templates/' + templateConfigEntry.fileName;
  var template = fs.readFileSync(templatePath, 'utf-8');
  var lines = template.split('\n');
  var participantMap = body.participants.reduce((res, cur, idx) => {
    const letter = String.fromCharCode(65 + idx);
    return Object.assign(res, { [letter]: cur })
  }, {});
  var firstDate = new Date(Date.parse(body.startDate));
  var interval = body.interval;
  var rounds = lines.reduce((result, line) => {
    const rid = parseInt(line.substr(0, 2)) - 1;
    const p1 = participantMap[line.substr(5, 1)];
    const p2 = participantMap[line.substr(7, 1)];
    const p3 = participantMap[line.substr(9, 1)];
    const p4 = participantMap[line.substr(11, 1)];
    let startDate = new Date(firstDate.getTime());
    let endDate = new Date(firstDate.getTime());
    startDate.setDate(startDate.getDate() + rid * interval);
    endDate.setDate(endDate.getDate() + (rid + 1) * interval - 1);
    result.length < rid + 1 && result.push({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      matches: []
    });
    result[rid].matches.push({ player: [[p1, p2], [p3, p4]] });
    return result;
  }, [])
  tournament.rounds = rounds;
  const filePath = './data/tournaments/' + body.id + ".json";
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(tournament), 'utf-8');
  }
  response.sendStatus(200);
};
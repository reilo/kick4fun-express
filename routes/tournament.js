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
    var id = cur.substr(0, cur.lastIndexOf('.'));
    var data = fs.readFileSync(dirPath + cur, 'utf-8');
    var json = JSON.parse(data);
    let item = { id: id, name: json.name, type: json.type };
    const table = calculateTable(json);
    table && table.length && Object.assign(item, {
      ranking: table.reduce((res, cur, index) => {
        index < 3 && res.push(cur.player);
        return res;
      }, [])
    });
    res.push(item);
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
        var result = match.sets.reduce((res, cur) => {
          res[0] += cur[0] > cur[1] ? 1 : 0;
          res[1] += cur[0];
          res[2] += cur[1];
          return res;
        }, [0, 0, 0]);
        match.player[0].forEach(player => {
          map[player].matches += 1;
          map[player].wins += result[0] > numSets/2;
          switch (data.counting) {
            case 'liga-1':
              map[player].score += result[0] > numSets/2;
              break;
            case 'liga-2':
            default:
              map[player].score += result[0];
              break;
          }
          map[player].goalsScored += result[1];
          map[player].goalsShipped += result[2];
        });
        match.player[1].forEach(player => {
          map[player].matches += 1;
          map[player].wins += result[0] < numSets/2;
          switch (data.counting) {
            case "liga-1":
              map[player].score += result[0] < numSets/2;
              break;
            case "liga-2":
            default:
              map[player].score += numSets - result[0];
              break;
          }
          map[player].goalsScored += result[2];
          map[player].goalsShipped += result[1];
        });
        match.result = [result[0], numSets - result[0]];
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
var fs = require('fs');
var utils = require('../utils');
var appConfig = require('../appConfig');

exports.get = function (request, response, next) {
  var tid = request.params.id;
  var tournamentPath = appConfig.dataPath + 'tournaments/' + tid + ".json";
  var tdata = fs.readFileSync(tournamentPath, 'utf-8');
  var pjson = utils.getParticipants();
  tdata = pjson.reduce((data, item) =>
    data.replace(new RegExp("\"" + item.id + "\"", "g"), "\"" + item.name + "\"")
    , tdata);
  var tjson = JSON.parse(tdata);
  tjson.id = tid;
  const scores = calculateScores(tjson, true);
  tjson.table = scores.overall;
  tjson.topScorer = scores.topScorer;
  tjson.topDefender = scores.topDefender;
  tjson.plainMatches = scores.plainMatches;
  tjson.narrowMatches = scores.narrowMatches;
  tjson.to0Matches = scores.to0Matches;
  tjson.to9Matches = scores.to9Matches;
  response.status(200).send(tjson);
};

exports.list = function (request, response, next) {
  var pjson = utils.getParticipants();
  var pmap = pjson.reduce((res, cur) =>
    Object.assign(res, { [cur.id]: cur.name })
    , {});
  var dirPath = appConfig.dataPath + 'tournaments/';
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
        createdBy: pmap[json.createdBy],
        official: json.official,
        status: json.status,
        completedDate: json.completedDate
      };
      const table = calculateScores(json).overall;
      table && table.length && Object.assign(item, {
        ranking: table.reduce((res, cur, index) => {
          index < 3 && res.push(pmap[cur.player]);
          return res;
        }, [])
      });
      res.push(item);
    }
    return res;
  }, []);
  response.status(200).send(tournaments);
};

function calculateScores(data, includeStatistics) {
  var template = { "matches": 0, "wins": 0, "score": 0, "goalsScored": 0, "goalsShipped": 0 };
  var results = { overall: [], topScorer: [], topDefender: [], plainMatches: [], to0Matches: [], to9Matches: [] }
  if (!data.participants) {
    return results;
  }
  var map = data.participants.reduce((obj, cur) => {
    obj[cur] = Object.assign({}, template);
    return obj;
  }, {});
  data.rounds.forEach(round => {
    round.matches.forEach(match => {
      if (match.sets && match.sets.length) {
        var numSets = match.sets.length;
        if (includeStatistics) {
          let to0Pushed = false;
          let to9Pushed = false;
          for (let i = 0; i < numSets; i++) {
            const sets = match.sets[i];
            if (!to0Pushed && sets.indexOf(10) > -1 && sets.indexOf(0) > -1) {
              results.to0Matches.push(match);
              to0Pushed = true;
            }
            if (!to9Pushed && sets.indexOf(10) > -1 && sets.indexOf(9) > -1) {
              results.to9Matches.push(match);
              to9Pushed = true;
            }
          }
        }
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
        if (includeStatistics) {
          results.plainMatches.push(match);
        }
      }
    })
  });
  for (var key in map) {
    results.overall.push(Object.assign(map[key], { player: key }));
    if (includeStatistics) {
      results.topScorer.push(Object.assign(map[key], { player: key }));
      results.topDefender.push(Object.assign(map[key], { player: key }));
    }
  }
  results.overall.sort((a, b) => {
    var diff = a.score - b.score;
    if (!diff) {
      diff = (a.goalsScored - a.goalsShipped) - (b.goalsScored - b.goalsShipped);
      if (!diff) {
        diff = a.goalsScored - b.goalsScored;
      }
    }
    return -diff;
  });
  if (includeStatistics) {
    results.topScorer.sort((a, b) => {
      var diff = a.goalsScored - b.goalsScored;
      if (!diff) {
        diff = (a.goalsScored - a.goalsShipped) - (b.goalsScored - b.goalsShipped);
        if (!diff) {
          diff = b.goalsShipped - a.goalsShipped;
        }
      }
      return -diff;
    });
    results.topDefender.sort((a, b) => {
      var diff = b.goalsShipped - a.goalsShipped;
      if (!diff) {
        diff = (a.goalsScored - a.goalsShipped) - (b.goalsScored - b.goalsShipped);
        if (!diff) {
          diff = a.goalsScored - b.goalsScored;
        }
      }
      return -diff;
    });
    results.plainMatches.sort((a, b) => {
      var diffa = a.sets.reduce((res, cur) => res + cur[0] - cur[1], 0);
      var diffb = b.sets.reduce((res, cur) => res + cur[0] - cur[1], 0);
      return Math.abs(diffb) - Math.abs(diffa);
    });
  }
  return results;
}

exports.update = function (request, response, next) {
  var tid = request.params.id;
  var tournament = utils.getTournament(tid);
  var body = request.body;
  if (body.password != tournament.password) {
    next({ message: 'Ungültiges Password', status: 400 });
    return;
  }
  if (!body.name) {
    next({ message: 'Name darf nicht leer sein', status: 400 });
    return;
  }
  if (!body.createdBy || !body.createdBy.length) {
    next({ message: 'Ersteller darf nicht leer sein', status: 400 });
    return;
  }
  tournament.name = body.name;
  tournament.createdBy = body.createdBy;
  tournament.backup && utils.backupTournament(tid);
  utils.writeTournament(tid, tournament);
  response.status(200).send(tournament);
};

exports.create = function (request, response, next) {
  var body = request.body;
  var tid = body.id;
  if (!body.id || !body.id.length) {
    next({ message: 'ID darf nicht leer sein', status: 400 });
    return;
  }
  if (!body.name || !body.name.length) {
    next({ message: 'Name darf nicht leer sein', status: 400 });
    return;
  }
  if (!body.createdBy || !body.createdBy.length) {
    next({ message: 'Ersteller darf nicht leer sein', status: 400 });
    return;
  }
  if (!utils.isDate(body.startDate)) {
    next({ message: 'Ungültiges Datumsformat', status: 400 });
    return;
  }
  if (!body.interval || body.interval < 0) {
    next({ message: 'Intervall muss > 0 sein', status: 400 });
    return;
  }
  const filePath = appConfig.dataPath + 'tournaments/' + body.id + ".json";
  if (fs.existsSync(filePath)) {
    next({ message: 'ID wird schon benutzt', status: 400 });
    return;
  }
  var tournament = Object.assign({}, {
    createdBy: body.createdBy,
    name: body.name,
    type: "liga",
    counting: "liga-2",
    official: false,
    status: "progress",
    password: body.password,
    participants: body.participants
  });
  var tConfigData = fs.readFileSync(appConfig.dataPath + 'templates/templateConfig.json', 'utf-8');
  var tConfig = JSON.parse(tConfigData);
  var tEntry = tConfig.find(template => template.id === body.template);
  if (body.participants.length != tEntry.players) {
    next({ message: 'Anzahl der Spieler muss ' + tEntry.players + ' sein', status: 400 });
    return;
  }
  var templatePath = appConfig.dataPath + 'templates/' + tEntry.fileName;
  var template = fs.readFileSync(templatePath, 'utf-8');
  var lines = template.split('\n');
  var shuffledParticipants = utils.shuffle(body.participants);
  var participantMap = shuffledParticipants.reduce((res, cur, idx) => {
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
    interval > 0 && endDate.setDate(endDate.getDate() + (rid + 1) * interval - 1);
    result.length < rid + 1 && result.push({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      matches: []
    });
    result[rid].matches.push({ player: [[p1, p2], [p3, p4]] });
    return result;
  }, [])
  tournament.rounds = rounds;
  fs.writeFileSync(filePath, JSON.stringify(tournament), 'utf-8');
  response.status(200).send(tournament);
};
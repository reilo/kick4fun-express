var fs = require('fs');
var utils = require('../utils');

exports.update = function (request, response, next) {
  var tid = request.params.tid;
  var rid = parseInt(request.params.rid);
  var mid = parseInt(request.params.mid);
  var body = request.body;
  var tournament = utils.getTournament(tid);
  var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  if (body.password != tournament.password) {
    next({ message: 'Ungültiges Password', status: 400 });
  } else if (!utils.isDate(body.date)) {
    next({ message: 'Ungültiges Datumsformat', status: 400 });
  } else if (body.sets.length != 3 || !body.sets.reduce((res, set) => res && set.length == 2, true)) {
    next({ message: 'Ungültige Ergebnisse', status: 400 });
  } else if (!body.sets.reduce((res, set) => res && set.reduce((res2, goals) =>
    res2 && numbers.indexOf(goals) > -1, true), true)) {
    next({ message: 'Ungültige Ergebnisse', status: 400 });
  } else {
    tournament.backup && utils.backupTournament(tid);
    Object.assign(tournament.rounds[rid].matches[mid], { date: body.date, sets: body.sets });
    utils.writeTournament(tid, tournament);
    response.status(200).send(tournament);
  }
};

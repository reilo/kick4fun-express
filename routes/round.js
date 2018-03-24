var fs = require('fs');
var utils = require('../utils');

exports.update = function (request, response, next) {
  var tid = request.params.tid;
  var rid = request.params.rid;
  var body = request.body;
  var tournament = utils.getTournament(tid);
  if (body.password != tournament.password) {
    next({ message: 'Ungültiges Password', status: 400 });
  } else if (!utils.isDate(body.startDate) || !utils.isDate(body.endDate)) {
    next({ message: 'Ungültiges Datumsformat', status: 400 });
  } else {
    tournament.backup && utils.backupTournament(tid);
    Object.assign(tournament.rounds[rid], { startDate: body.startDate, endDate: body.endDate });
    utils.writeTournament(tid, tournament);
    response.status(200).send(tournament);
  }
};
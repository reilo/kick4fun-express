var utils = require('../utils');

exports.list = (request, response) => {
  response.status(200).send(utils.getParticipants());
};

exports.update = function (request, response, next) {
  var id = request.params.id;
  var body = request.body;
  var players = utils.getParticipants();
  var player = players.filter(player => player.id == id);
  var playerByName = players.filter(player =>
    player.id != id && player.name == body.name
  );
  var ligaStatus = utils.getLigaStatus();
  if (body.password != ligaStatus.password) {
    next({ message: 'Ungültiges Password', status: 400 });
    return;
  } else if (!player) {
    next({ message: 'Ungültige Spieler-ID', status: 400 });
    return;
  } else if (playerByName) {
    next({ message: 'Spielername existiert schon', status: 400 });
    return;
  } else if (body.name.length < 0) {
    next({ message: 'Spielername darf nicht leer sein', status: 400 });
    return;
  } else if (body.fullName.length < 0) {
    next({ message: 'Spielername darf nicht leer sein', status: 400 });
    return;
  } else {
    //utils.backupPlayers();
    response.sendStatus(200);
  }
};

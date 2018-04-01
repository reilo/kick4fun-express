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
  var playerByFullName = players.filter(player =>
    player.id != id && player.fullName == body.fullName
  );
  var ligaStatus = utils.getLigaStatus();
  if (body.password != ligaStatus.adminPassword) {
    next({ message: 'Ungültiges Password', status: 400 });
    return;
  } else if (!player.length) {
    next({ message: 'Ungültige Spieler-ID', status: 400 });
    return;
  } else if (playerByName.length || playerByFullName.length) {
    next({ message: 'Spielername existiert schon', status: 400 });
    return;
  } else if (body.name.length < 0) {
    next({ message: 'Spielername darf nicht leer sein', status: 400 });
    return;
  } else if (body.fullName.length < 0) {
    next({ message: 'Spielername darf nicht leer sein', status: 400 });
    return;
  } else {
    utils.backupPlayers();
    player[0].name = body.name;
    player[0].fullName = body.fullName;
    player[0].active = body.active;
    player[0].real = body.real;
    utils.writePlayers(players);
    response.status(200).send(player[0]);
  }
};

exports.create = function (request, response, next) {
  var body = request.body;
  var players = utils.getParticipants();
  var playerIds = players.reduce((res, cur) => {
    res.push(cur.id);
    return res;
  }, []);
  var playerByName = players.filter(player => player.name == body.name);
  var playerByFullName = players.filter(player => player.fullName == body.fullName);
  var ligaStatus = utils.getLigaStatus();
  if (body.password != ligaStatus.adminPassword) {
    next({ message: 'Ungültiges Password', status: 400 });
    return;
  } else if (playerByName.length || playerByFullName.length) {
    next({ message: 'Spielername existiert schon', status: 400 });
    return;
  } else if (body.name.length < 0) {
    next({ message: 'Spielername darf nicht leer sein', status: 400 });
    return;
  } else if (body.fullName.length < 0) {
    next({ message: 'Spielername darf nicht leer sein', status: 400 });
    return;
  } else {
    utils.backupPlayers();
    var player = {
      id: createId(body.fullName, playerIds),
      name: body.name,
      fullName: body.fullName,
      active: body.active,
      real: body.real
    };
    players.push(player);
    utils.writePlayers(players);
    response.status(200).send(player);
  }
};

function createId(fullName, playerIds) {
  var parts = fullName.toLowerCase().split(' ');
  var ids = []
  ids.push((parts[0][0] + parts[parts.length - 1][0]));
  ids.push((parts.reduce((res, cur) => res + cur[0], "")));
  if (parts.length > 1) {
    parts[0].length > 1 && ids.push(parts[0].substr(0, 2));
    parts[0].length > 1 && ids.push((parts[0].substr(0, 2) + parts[1][0]));
    parts[0].length > 1 && parts[1].length > 1 &&
      ids.push((parts[0].substr(0, 2) + parts[1].substr(0, 2)));
    ids.push(parts[1]);
  }
  parts[0].length > 2 && ids.push(parts[0].substr(0, 3));
  ids.push(parts[0]);
  for (var i = 0; i < ids.length; i++) {
    if (playerIds.indexOf(ids[i]) < 0) {
      return ids[i];
    }
  }
  return Date.now().toString();
}
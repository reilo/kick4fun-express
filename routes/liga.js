var fs = require('fs');

exports.data = function (request, response, next) {
  var filePath = './data/liga/' + request.params.id + ".json";
  var data = fs.readFileSync(filePath, 'utf-8');
  response.status(200).send(JSON.parse(data));
};

exports.tabelle = function (request, response, next) {
  var filePath = './data/liga/' + request.params.id + ".json";
  var data = fs.readFileSync(filePath, 'utf-8');
  var json = JSON.parse(data);
  data = berechneTabelle(json);
  response.status(200).send(data);
};

function berechneTabelle(data) {
  var template = { "Spiele": 0, "Siege": 0, "Punkte": 0, "TorePlus": 0, "ToreMinus": 0 };
  var map = data.Teilnehmer.reduce((obj, cur) => {
    obj[cur] = Object.assign({}, template);
    return obj;
  }, {});
  data.Runden.forEach(runde => {
    runde.Spiele.forEach(spiel => {
      var ergebnis = spiel.Ergebnis.reduce((res, cur) => {
        res[0] += cur[0] > cur[1] ? 1 : 0;
        res[1] += cur[0];
        res[2] += cur[1];
        return res;
      }, [0, 0, 0]);
      spiel.Spieler[0].forEach(spieler => {
        map[spieler].Spiele += 1;
        map[spieler].Siege += ergebnis[0] > 1;
        map[spieler].Punkte += ergebnis[0];
        map[spieler].TorePlus += ergebnis[1];
        map[spieler].ToreMinus += ergebnis[2];
      });
      spiel.Spieler[1].forEach(spieler => {
        map[spieler].Spiele += 1;
        map[spieler].Siege += ergebnis[0] < 2;
        map[spieler].Punkte += 3 - ergebnis[0];
        map[spieler].TorePlus += ergebnis[2];
        map[spieler].ToreMinus += ergebnis[1];
      });
    })
  });
  var tabelle = []
  for (var key in map) {
    tabelle.push(Object.assign(map[key], {Spieler: key}));
  }
  tabelle.sort((a, b) => {
    var diff = a.Punkte - b.Punkte;
    if (!diff) {
      diff = (a.TorePlus - a.ToreMinus) - (b.TorePlus + b.ToreMinus);
      if (!diff) {
        diff = a.TorePlus - b.TorePlus;
      }
    }
    return -diff;
  });
  return tabelle;
}
const express = require('express');
const router = express.Router();

const kickerliga = require('./kickerliga');
const player = require('./player');
const tournament = require('./tournament');
const round = require('./round');
const match = require('./match');
const template = require('./template');

router.get('/kickerliga', kickerliga.get);

router.get('/kickerliga/players', player.list);
router.post('/kickerliga/players', player.create);
router.put('/kickerliga/players/:id', player.update);

router.get('/kickerliga/tournaments', tournament.list);
router.get('/kickerliga/tournaments/:id', tournament.get);
router.post('/kickerliga/tournaments', tournament.create);
router.put('/kickerliga/tournaments/:id', tournament.update);

router.put('/kickerliga/tournaments/:tid/rounds/:rid', round.update);

router.put('/kickerliga/tournaments/:tid/rounds/:rid/matches/:mid', match.update);

router.get('/kickerliga/templates', template.list);

module.exports = router;
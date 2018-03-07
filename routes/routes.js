const express = require('express');
const router = express.Router();

const kickerliga = require('./kickerliga');
const tournament = require('./tournament');
const template = require('./template');

router.get('/kickerliga', kickerliga.get);

router.get('/kickerliga/tournaments', tournament.list);
router.get('/kickerliga/tournaments/:id', tournament.get);

router.get('/kickerliga/templates', template.list);
router.get('/kickerliga/templates/:id', template.get);

module.exports = router;
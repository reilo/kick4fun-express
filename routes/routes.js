const express = require('express');
const router = express.Router();

const liga = require('./liga.js');

router.get('/liga/:id', liga.data);
router.get('/liga/:id/tabelle', liga.tabelle);

module.exports = router;
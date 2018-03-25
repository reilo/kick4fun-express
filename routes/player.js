var utils = require('../utils');

exports.list = (request, response) => {
  response.status(200).send(utils.getParticipants());
};
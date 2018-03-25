var utils = require('../utils');

exports.get = (request, response) => {
  response.status(200).send( utils.getLigaStatus());
};

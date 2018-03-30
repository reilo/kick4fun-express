var utils = require('../utils');

exports.get = (request, response) => {
  var ligaStatus = utils.getLigaStatus();
  delete ligaStatus.adminPassword;
  response.status(200).send(ligaStatus);
};

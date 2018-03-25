var utils = require('../utils');

exports.list = function (request, response, next) {
  response.status(200).send(utils.getTemplateConfig());
};
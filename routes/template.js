var fs = require('fs');

exports.get = function (request, response, next) {
  var filePath = './data/templates/' + request.params.id + ".json";
  var data = fs.readFileSync(filePath, 'utf-8');
  var json = JSON.parse(data);
  response.status(200).send(json);
};

exports.list = function (request, response, next) {
  var dirPath = './data/templates/';
  var files = fs.readdirSync(dirPath);
  var templates = files.reduce((res, cur) => {
    var id = cur.substr(0, cur.lastIndexOf('.'));
    var data = fs.readFileSync(dirPath + cur, 'utf-8');
    var json = JSON.parse(data);
    res.push({ id: id });
    return res;
  }, []);
  response.status(200).send(templates);
};
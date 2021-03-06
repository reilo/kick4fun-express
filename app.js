var express = require("express");
var bodyParser = require("body-parser");
var routes = require("./routes/routes");

var config = require("./appConfig.js");

var port = config.port;
var appPath = config.appPath;

var allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

var consoleLog = (req, res, next) => {
  console.log(req.method + ": " + req.url);
  next();
}

var app = express();
app.set('port', port);
app.use(allowCrossDomain);
app.use(consoleLog);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(appPath + 'api', routes);

// handle errors
app.use((error, request, response, next) => {
  console.log(error);
  response.statusMessage = error.message;
  response.status(error.status).end();
});

//routes(app);

var server = app.listen(port, function () {
  console.log("app running on port:", server.address().port);
});
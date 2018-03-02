var fs=require('fs');

var appRouter = function (app) {
  app.get("/", function(req, res) {
    var data=fs.readFileSync('data.json', 'utf8');
    //var words=JSON.parse(data);
    //res.status(200).send(words.message);
    res.status(200).send(JSON.parse(data).authors);
    console.log("data sent:", JSON.parse(data).authors);
    //res.status(200).send("Welcome to our restful API");
  });
}

module.exports = appRouter;
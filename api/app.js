const restify = require('restify');
const data = require('./data/products.json');

// Server
const server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());

server.get("/search/quick", (req, res, next) => {
  res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify(data));
  return next();
});

server.listen(3002, () => {
  console.log('%s listening at %s', server.name, server.url);
});

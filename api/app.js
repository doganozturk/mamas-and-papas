const restify = require('restify');
const searchAll = require('./elasticsearch/searchAll');
const data = require('./data/products.json');

// Server
const server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});

// Middleware
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());

// Search endpoint
server.get("/search/quick", (req, res, next) => {
  let body = {
    size: 20,
    from: 0,
    query: {
      match_all: {}
    }
  };

  searchAll('library', body)
    .then(results => {
      console.log(`found ${results.hits.total} items in ${results.took}ms`);
      console.log(`returned product titles:`);

      results.hits.hits.forEach(
        (hit, index) => console.log(
          `\t${body.from + ++index} - ${hit._source.name}`
        )
      );

      res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      res.end(JSON.stringify(results.hits.hits));

      return next();
    })
    .catch(err => {
      console.error(err);

      res.writeHead(204, {'Content-Type': 'text/html; charset=utf-8'});
      res.end('<h1>Data not found!</h1>')
    });
});

// Fire up the server!
server.listen(3002, () => {
  console.log('%s listening at %s', server.name, server.url);
});

const restify = require('restify');
const search = require('./elasticsearch/search');
const _ = { get: require('lodash.get') };
const data = require('./data/products.json');

// Server
const server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});

// Middleware
server.use(restify.CORS());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());

// Search endpoint
server.get("/search/quick", (req, res, next) => {
  const keyword = _.get(req, 'query.keyword');

  let body = {
    query: {
      bool: {
        should: [
          {
            term: {
              isInStock: {
                boost: 100,
                value: true
              }
            }
          },
          {
            multi_match: {
              query: keyword,
              fields: ['sku', 'ediRef'],
              type: 'phrase'
            }
          },
          {
            multi_match: {
              query: keyword,
              fields: ['name', 'description'],
              fuzziness: 0.5
            }
          }
        ]
      }
    }
  };

  search('library', body)
    .then(results => {
      console.log(`found ${results.hits.total} items in ${results.took}ms`);
      console.log(`returned product titles:`);

      results.hits.hits.forEach(
        (hit, index) => console.log(
          `\t${body.from + ++index} - ${hit._source.name} - ${hit._source.isInStock}`
        )
      );

      const response = results.hits.hits.map(item => item._source);

      res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      res.end(JSON.stringify(response));

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

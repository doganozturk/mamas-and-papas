const search = require('../elasticsearch/search');
const _ = { get: require('lodash.get') };
const log = require('../logger');

// Build ElasticSearch query
function queryBuilder (keyword) {

  const body = {
    "size": 125, 
    "sort": [
      {
        "isInStock": {
          "order": "desc"
        }
      }
    ],
    "query": {
      "bool": {
        "should": [
          {
            "multi_match": {
              "query": keyword,
              "fields": ["sku", "ediRef"],
              "type": "phrase"
            }
          },
          {
            "multi_match": {
              "query": keyword,
              "fields": ["name", "description"],
              "fuzziness": 2
            }
          }
        ]
      }
    }
  };

  return body;
}

// Export module as a function
// to use in app.js
module.exports = (req, res, next) => {

  const body = queryBuilder(_.get(req, 'query.keyword'));

  search('library', body)
    .then(results => {
      log.info(`found ${results.hits.total} items in ${results.took}ms`);
      log.info(`returned product titles:`);

      results.hits.hits.forEach(
        (hit, index) => log.info(
          `\t${body.from + ++index} - ${hit._source.name} - ${hit._source.isInStock}`
        )
      );

      const response = results.hits.hits.map(item => item._source);

      res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      res.end(JSON.stringify(response));

      return next();
    })
    .catch(err => {
      log.info(err);

      res.writeHead(204, {'Content-Type': 'text/html; charset=utf-8'});
      res.end('<h1>Data not found!</h1>')
    });
};
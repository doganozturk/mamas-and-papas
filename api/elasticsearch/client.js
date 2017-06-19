const elasticsearch = require('elasticsearch');

// Setting up a new elastic search client
const esClient = new elasticsearch.Client({
  host: '127.0.0.1:9200',
  log: 'error'
});

module.exports = esClient;
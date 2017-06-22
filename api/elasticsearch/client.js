const elasticsearch = require('elasticsearch');

// Setting up a new elastic search client
const esClient = new elasticsearch.Client({
  host: '172.22.0.2:9200',
  log: 'error'
});

module.exports = esClient;
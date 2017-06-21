// ElasticSearch
const esClient = require('./client');
const log = require('../logger');

// Checking indices
const indices = () => {
  return esClient.cat.indices({v: true})
    .then(log.info)
    .catch(err => log.info(`Error connecting to the es client: ${err}`));
};

indices();
// ElasticSearch
const esClient = require('./client');

// Checking indices
const indices = () => {
  return esClient.cat.indices({v: true})
    .then(console.log)
    .catch(err => console.error(`Error connecting to the es client: ${err}`));
};

indices();
const esClient = require('./client');

const searchAll = (index, body) => {
  return esClient.search({index: index, body: body});
};

module.exports = searchAll;
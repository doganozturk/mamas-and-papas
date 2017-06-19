const esClient = require('./client');

const search = (index, body) => esClient.search({index: index, body: body});

module.exports = search;
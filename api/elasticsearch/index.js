const fs = require('fs');
const esClient = require('./client');
const log = require('../logger');

// Bulk index
const bulkIndex = (index, type, data) => {
  let bulkBody = [];

  data.forEach(item => {
    bulkBody.push({
      index: {
        _index: index,
        _type: type,
        _id: item.id
      }
    });

    bulkBody.push(item);
  });

  esClient.bulk({body: bulkBody})
    .then(response => {
      let errorCount = 0;

      response.items.forEach(item => {
        if (item.index && item.index.error)
          log.info(++errorCount, item.index.error);
      });

      log.info(
        `Successfully indexed ${data.length - errorCount}
        out of ${data.length} items`
      );
    })
    .catch(log.info);
};

const productsRaw = fs.readFileSync('./data/products.json');
const products = JSON.parse(productsRaw);

bulkIndex('library', 'products', products);
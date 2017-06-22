const fs = require('fs');
const esClient = require('./client');

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
          console.log(++errorCount, item.index.error);
      });

      console.log(
        `Successfully indexed ${data.length - errorCount}
        out of ${data.length} items`
      );
    })
    .catch(console.err);
};

const productsRaw = fs.readFileSync('./data/products.json');
const products = JSON.parse(productsRaw);

bulkIndex('library', 'products', products);
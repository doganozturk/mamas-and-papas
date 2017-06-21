const restify = require('restify');
const bunyan = require('bunyan');

// Logger
const Logger = bunyan.createLogger({
  name: 'api',
  streams: [
    {
      stream: process.stdout,
      level: 'debug'
    },
    {
      path: 'api.log',
      level: 'trace'
    }
  ],
  serializers: {
    req: bunyan.stdSerializers.req,
    res: restify.bunyan.serializers.res,
  },
});

module.exports = Logger;
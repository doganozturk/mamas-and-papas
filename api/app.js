const restify = require('restify');
const searchCtrl = require('./controllers/searchCtrl');
const log = require('./logger');

// Server
const server = restify.createServer({
  name: 'myapp',
  version: '1.0.0',
  log
});

// Let's log every incoming request. `req.log` is a "child" of our logger
// with the following fields added by restify:
// - a `req_id` UUID (to collate all log records for a particular request)
// - a `route` (to identify which handler this was routed to)
server.pre(function (req, res, next) {
  req.log.info({req: req}, 'start');
  return next();
});

// Middleware
server.use(restify.CORS());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());

// Search endpoint
server.get("/search/quick", searchCtrl);

// Let's log every response. Except 404s, MethodNotAllowed,
// VersionNotAllowed -- see restify's events for these.
server.on('after', function (req, res, route) {
  req.log.info({res: res}, "finished");
});

// Fire up the server!
server.listen(3002, () => {
  log.info('%s listening at %s', server.name, server.url);
});

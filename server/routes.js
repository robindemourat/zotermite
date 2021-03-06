/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var cors = require('cors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/models/', require('./api/models'));
  app.use('/api/templates', require('./api/template'));
  app.use('/api/convert', cors(), require('./api/convert'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};


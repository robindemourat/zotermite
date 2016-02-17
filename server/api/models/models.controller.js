'use strict';

var _ = require('lodash');
var models = require('./../../models/models.json');

// Get list of modelss
exports.index = function(req, res) {
  res.json(models);
};

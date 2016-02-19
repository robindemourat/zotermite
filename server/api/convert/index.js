'use strict';

var express = require('express');
var controller = require('./convert.controller');

var router = express.Router();

router.post('/:inputType/:template?', controller.index);

module.exports = router;

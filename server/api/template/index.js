'use strict';

var express = require('express');
var controller = require('./template.controller');

var router = express.Router();

router.get('/:fileName?', controller.index);

module.exports = router;

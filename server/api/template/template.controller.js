'use strict';

var _ = require('lodash');
var utils = require('./../api-utils.js');

// Get list of templates
exports.index = function(req, res) {
  res.header('Content-Type', 'application/json; charset=utf-8')
  if(req.params.fileName){

    utils.getTemplate(req.params.fileName, function(err, template){
      if(err){
        res.status(500).send({msg : 'problem while parsing template', error : err});
      }else{
        res.json(template);
      }
    });
  }else{
    utils.listTemplates(function(err, templates){
      if(err){
        res.status(500).send({msg : 'problem while parsing local files', error : err});
      }else{
        res.json(templates);
      }
    });
  }
};

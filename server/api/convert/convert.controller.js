'use strict';
var _ = require('lodash');
var utils = require('./../api-utils.js');
var templater = require('./../../zoterotemplater.js');
var models = require('./../../models/models.json');


var input;

templater.init(models);
// Get list of converts
exports.index = function(req, res) {
  var inputType = req.params.inputType,
      templateName = req.params.template,
      output;
  try{
    input = req.body;
    var items = input.items;

    if(!(items && items.length)){
      return res.status(406).send({msg : 'you must pass a property "items" in your post request, containing json zotero items as they are served by Zotero API.'});
    }

    if(input.template){
      templater.parseItems(input.template, items, function(err, output){
            if(err){
              return res.status(406).send(err);
            }else{
              return res.json(output);
            }
          });
    }else if(templateName){
      utils.getTemplate(templateName, function(err, template){
        if(err){
          res.status(404).send({msg : 'template not found', error : err})
        }else{
          templater.parseItems(template.content, items, function(err, output){
            if(err){
              return res.status(406).send(err)
            }else{
               return res.json(output);
            }
          });
        }
      })
    }else{
      return res.status(406).send({msg : 'you must specify a template to process your data - with the template parameter of the request, or by passing a template property in your request data'})
    }
  }catch(e){
    console.log(e);

    res.status(406).send({msg : 'sent data is badly formatted (not json)', error : e})
  }
};

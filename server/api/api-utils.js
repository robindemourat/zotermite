var express = require('express');
var _ = require('lodash');
var walk    = require('walk');
var fs      = require('fs');
var async = require('async');
var path = require('path');
var utils = {};

var templatesFolder = 'server/templates';


/*
=====================================
GLOBAL UTILS
=====================================
*/

//I make a text uri/slug friendly
var slugify = function(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/*
=====================================
FILES READING
=====================================
*/

//I read a file and return callback with error/content
function readAsync(file, callback) {
    fs.readFile(file, 'utf8', callback);
}

// I browse into a folder and return a list of its related file paths
var listFiles = function(dir, callback){
  //walk into files
  var walker  = walk.walk(dir, { followLinks: false }), files=[];
  walker.on('file', function(root, stat, next) {
      // Add this file to the list of files
      files.push(root + '/' + stat.name);
      next();
  });

  //when every file has been processed, return callback function
  walker.on('end', function() {
      callback(files);
  });
};

/*
=====================
APPLICATION SPECIFIC
=====================
*/

utils.getTemplate = function(fileName, callback){
  var path = templatesFolder + '/' + fileName + '.md';
  fs.readFile(path, 'utf8', function(err, content){
    if(err){
      callback(err, undefined);
    }else{
      callback(err, {
        title : fileName,
        path : path,
        content : content
      });
    }
  })
}

utils.listTemplates = function(callback){
  listFiles(templatesFolder, function(filesList){
    return callback(undefined, filesList.map(function(file){
      var titleParts = file.split('/');
      var title = titleParts[titleParts.length - 1].split('.')[0];
      return {title : title};
    }));
  });
}



module.exports = utils;

'use strict';

angular.module('zotermiteApp')
  .factory('ZoteroTemplateParser', function () {
    var factory = {};

    var templatesModels = {
        'zotero_url' : ['links', 'alternate', 'href'],
      'title' : ['data', 'title'],
      'creators' : ['data', 'creators'],
      'type' : ['data', 'itemType'],
      'url' : ['data', 'url'],
      'date' : ['data', 'date'],
        'language' : ['data', 'language'],
        'short_title' : ['data', 'shortTitle'],

        'abstract' : ['data', 'abstractNote'],

        'website_title' : ['data', 'websiteTitle'],
        'website_type' : ['data', 'websiteType'],

        'ISSN' : ['data', 'ISSN'],
        'DOI' : ['data', 'DOI'],
        'issue_number' : ['data', 'issue'],
        'volume_number': ['data', 'volume'],
        'pages' : ['data', 'pages'],
        'publication_title' : ['data', 'publicationTitle'],
        "library_catalog" : ['data', 'libraryCatalog'],

      'authors' : ['data', 'creators'],

      'creator_1_first_name' : ['data', 'creators', 0, 'firstName'],
      'creator_1_last_name' : ['data', 'creators', 0, 'lastName'],
      'creator_1_type' : ['data', 'creators', 0, 'creatorType'],

      'creator_2_first_name' : ['data', 'creators', 1, 'firstName'],
      'creator_2_last_name' : ['data', 'creators', 1, 'lastName'],
      'creator_2_type' : ['data', 'creators', 1, 'creatorType'],

      'creator_3_first_name' : ['data', 'creators', 2, 'firstName'],
      'creator_3_last_name' : ['data', 'creators', 2, 'lastName'],
      'creator_3_type' : ['data', 'creators', 2, 'creatorType'],

      'creator_4_first_name' : ['data', 'creators', 3, 'firstName'],
      'creator_4_last_name' : ['data', 'creators', 3, 'lastName'],
      'creator_4_type' : ['data', 'creators', 3, 'creatorType'],

      'creator_5_first_name' : ['data', 'creators', 4, 'firstName'],
      'creator_5_last_name' : ['data', 'creators', 4, 'lastName'],
      'creator_5_type' : ['data', 'creators', 4, 'creatorType'],

    };

    var accessObjectProperty = function(item, path){
      var cursor = item, prop;
      for(var i in path){
        prop = path[i];
        cursor = cursor[prop];
        if(!cursor)
          break;
      }
      return cursor;
    }

    var findValInItem = function(val, item){
      console.log('find val : ', val);
      var arrayRE = /(.*)\[(\d+)\]/,
          matchArray;
      var key = val, additionalPath = [];
      //process properties and array accesses
      //first, process properties
      additionalPath = key.split('.');
      additionalPath.forEach(function(expression, index){
        matchArray = arrayRE.exec(expression);
        if(matchArray){
          var arrayName = matchArray[1];
          var arrayIndex = +matchArray[2];
          additionalPath[index] = arrayName;
          additionalPath.splice(index+1, 0, arrayIndex);
        }
      });
      key = additionalPath.shift();
      var path = templatesModels[key];
      if(!path){
        return;
      }
      path = path.concat(additionalPath);
      // console.log('template key : ', key, 'complete path : ', path);

      return accessObjectProperty(item, path);
    };

    var fetchVal = function(val, item){
      var n = findValInItem(val, item);
      return (n)?n:'';
    };

    var checkVal = function(val, item){
      return (findValInItem(val,item))?true:false;
    };

    var getLoopLength = function(expression, item){
      var r = /(.*)\s+in\s+(.*)/gi, match;
      while(match = r.exec(expression)){
        var val = match && match[2];
        if(val){
          var prop = findValInItem(val, item);
          if(Array.isArray(prop)){
            return prop.length;
          }else{
            return undefined;
          }
        }
      }
      return undefined;
    }

    var substituteLoopVals = function(input, expression, loopLength){
      var r = /(.*)\s+in\s+(.*)/gi, match;
      while(match = r.exec(expression)){
        var val = match && match[1];
        var key = match && match[2];
        if(key){
          var output = '';
          for(var i = 0 ; i < loopLength ; i++){
            var line = input.replace(new RegExp(val, 'gi'), key + '[' + i + ']') + '\n';
            output += line;
          }
          return output;
        }
      }
      return input;
    }

    var populateTemplate = function(template, item){
        //var r = /\$(\w+):(\w+)\$/gi;
      // var r = /\$(\w+):?([\w\s]+)?\$/gi;
      // var r = /\$([\w\[\])]+):?([\w\s]+)?\$/gi;
      var r = /\$([^$]+)\$/gi;
        var activeStr = template;
      if(activeStr === undefined){
        activeStr = '';
      }
      var matches = activeStr.match(r);
      if(matches){
        for(var i in matches){
          r.exec('');
          // var expressions = r.exec(matches[+i]);
          var expressions = matches[+i].split(':');
          var statement = expressions[0].replace(/\$/g, '');
          var val = (expressions.length > 1)?expressions[1].replace(/\$/g, ''):undefined;
          console.log(statement, val);

          // var statement = expressions[1];
          // var val = expressions[2];
          var matching
          //case of implicit 'set'
          if(!val){
              val = statement;//expressions[1];
              statement = 'set';
              matching = '\\\$'+val.replace(/\./g, '\\\.').replace(/\[/g, '\\\[').replace(/\]/g, '\\\]')+'\\\$'
          }else{
            matching = '\\\$'+statement.replace(/\./g, '\\\.').replace(/\[/g, '\\\[').replace(/\]/g, '\\\]')+':'+val.replace(/\./g, '\\\.').replace(/\[/g, '\\\[').replace(/\]/g, '\\\]')+'\\\$';
          }
          switch(statement){
            //conditionnal
            case 'if':
                // var catchExpression = new RegExp('(\\\$'+statement+':'+val+'\\\$)(\\n.*)(?!\\\$endif:'+val+'\\\$)\\n?(\\\$endif:'+val+'\\\$)', 'gi');
                var catchExpression = new RegExp('(\\\$'+statement+':'+val+'\\\$)[\\\s|\\\w|\\\S]*(\\\$endif:'+val+'\\\$)', 'gi');
                var catchAll = new RegExp('(\\\$'+statement+':'+val+'\\\$[\\\s|\\\w|\\\S]*\\\$endif:'+val+'\\\$)', 'gi');
                var toDelete = (checkVal(val, item))?catchExpression.exec(activeStr):catchAll.exec(activeStr);
                if(toDelete){
                    activeStr = activeStr.replace(toDelete[1], '').replace(toDelete[2], '');
                }
            break;

            //loop
            case 'loop':
                // var catchExpression = new RegExp('(\\\$'+statement+':'+val+'\\\$)([\\\s|\\\w|\\\S]*)(\\\$endloop:'+val+'\\\$)', 'gi');
                // var catchExpression = new RegExp('(\\\$'+statement+':'+val+'\\\$)(\\n.*)(?!\\\$endloop:'+val+'\\\$)\\n?(\\\$endloop:'+val+'\\\$)', 'gi');
                var catchExpression = new RegExp('(\\\$'+statement+':'+val+'\\\$)(\\n.*)(?!\\\$endloop:'+val+'\\\$)\\n?(\\\$endloop:'+val+'\\\$)', 'gi');
                var catchAll = new RegExp('(\\\$'+statement+':'+val+'\\\$[\\\s|\\\w|\\\S]*\\\$endloop:'+val+'\\\$)', 'gi');
                var parts = catchExpression.exec(activeStr);
                var loopLength = getLoopLength(val, item);
                if(loopLength && parts){
                  activeStr = activeStr.replace(parts[1], '').replace(parts[3], '');
                  var newExpression = substituteLoopVals(parts[2], val, loopLength);
                  activeStr = activeStr.replace(parts[2], newExpression);
                }else{
                  activeStr = activeStr.replace(catchAll, '');
                }
            break;

            //replace by value
            case 'set':
              if(val != 'endif'){
                  var newVal = fetchVal(val, item);
                  matching = new RegExp(matching, 'g');
                  console.log('set', val, 'from', matching, ' to ', newVal);
                  activeStr = activeStr.replace(matching, newVal);
              }
            break;

            default:
            break;
          }
        }
      };
        //filename grabbing (after everything else has been proceeded)
        var titleMatch = /(\$filename:begin\$[\s\w\S]*\$filename:end\$)/gi,
            titleValsMatch = /(\$filename:begin\$)([\s\w\S]*)(\$filename:end\$)/gi,
            title = '',
            titleVals = activeStr.match(titleMatch);
        if(titleVals){
            activeStr = activeStr.replace(titleMatch, '');
            var values = titleValsMatch.exec(titleVals[0]);
            title = values[2];
        };
      return {
                    body : activeStr,
                    filename : title
                };
    };

    factory.parseZoteroItemWithTemplate = function(template, item){
      var str = '', match, output;
      var r = /\$(.+):?(.+)?\$/gi;

      output = populateTemplate(template, item);
      //consume template while expressions are present
      while(match = r.exec(output.body)){
        output = populateTemplate(output.body, item);
      }
      return output;
    };

    return factory;
  });

'use strict';

angular.module('zotermiteApp')
  .factory('ZoteroTemplateParser', function () {
    var factory = {};

    var templateModels;

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
      var path = templateModels[key];
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
      var options = expression.split(':');
      expression = options.shift();
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
      // fetching possible options
      var parts = expression.split(':');
      var options = {};

      expression = parts.shift();

      parts.forEach(function(part){
        var components = part.split('=');
        if(components[1]){
          options[components[0]] = components[1];
        }
      });
      var r = /(.*)\s+in\s+(.*)/gi, match;
      while(match = r.exec(expression)){
        var val = match && match[1];
        var key = match && match[2];
        if(key){
          var output = '';
          for(var i = 0 ; i < loopLength ; i++){
            var line = input
                        .replace(new RegExp(val, 'gi'), key + '[' + i + ']')//substitute
                        .trim();

            if(options.separator && i != loopLength - 1){
              line += options.separator;
            }else if(options.terminator && i == loopLength - 1){
              line += options.terminator;
            }
            line += '\n';
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
          var matching;

          r.exec('');
          // var expressions = r.exec(matches[+i]);
          var expressions = matches[+i].split(':');
          var statement = expressions[0].replace(/\$/g, '');
          expressions.shift();
          var val;

          if(expressions.length == 0){
              val = statement;
              statement = 'set';
              matching = '\\\$'+val.replace(/\./g, '\\\.').replace(/\[/g, '\\\[').replace(/\]/g, '\\\]')+'\\\$'
          }else{
            val = expressions.join(':').replace(/\$/g, '');
            matching = '\\\$'+statement.replace(/\./g, '\\\.').replace(/\[/g, '\\\[').replace(/\]/g, '\\\]')+':'+val.replace(/\./g, '\\\.').replace(/\[/g, '\\\[').replace(/\]/g, '\\\]')+'\\\$';
          }



          // var statement = expressions[1];
          // var val = expressions[2];
          //case of implicit 'set'

          switch(statement){
            //conditionnal
            case 'if':
                var openingExpression = '$if:'+val+'$';
                var endingExpression = '$endif:'+val+'$';
                var openingPart = [activeStr.indexOf(openingExpression), activeStr.indexOf(openingExpression) + openingExpression.length];
                var contentPart = [activeStr.indexOf(openingExpression) + openingExpression.length, activeStr.indexOf(endingExpression)];
                var endingPart = [activeStr.indexOf(endingExpression), activeStr.indexOf(endingExpression) + endingExpression.length];

                var opening = activeStr.substring(openingPart[0], openingPart[1]),
                      content = activeStr.substring(contentPart[0], contentPart[1]),
                      ending = activeStr.substring(endingPart[0], endingPart[1]);

                var hasVal = (checkVal(val, item))?true:false;
                activeStr = activeStr.replace(opening, '').replace(ending, '');
                if(!hasVal){
                  activeStr = activeStr.replace(content, '');
                }
            break;

            case 'ifnot':
                var openingExpression = '$ifnot:'+val+'$';
                var endingExpression = '$endifnot:'+val+'$';
                var openingPart = [activeStr.indexOf(openingExpression), activeStr.indexOf(openingExpression) + openingExpression.length];
                var contentPart = [activeStr.indexOf(openingExpression) + openingExpression.length, activeStr.indexOf(endingExpression)];
                var endingPart = [activeStr.indexOf(endingExpression), activeStr.indexOf(endingExpression) + endingExpression.length];

                var opening = activeStr.substring(openingPart[0], openingPart[1]),
                      content = activeStr.substring(contentPart[0], contentPart[1]),
                      ending = activeStr.substring(endingPart[0], endingPart[1]);

                var hasVal = (checkVal(val, item))?true:false;
                activeStr = activeStr.replace(opening, '').replace(ending, '');
                if(hasVal){
                  activeStr = activeStr.replace(content, '');
                }
            break;

            //loop
            case 'loop':

                var openingExpression = '$loop:'+val+'$';
                var valWithoutOptions = val.split(':')[0];
                var endingExpression = '$endloop:'+valWithoutOptions+'$';
                var openingPart = [activeStr.indexOf(openingExpression), activeStr.indexOf(openingExpression) + openingExpression.length];
                var contentPart = [activeStr.indexOf(openingExpression) + openingExpression.length, activeStr.indexOf(endingExpression)];
                var endingPart = [activeStr.indexOf(endingExpression), activeStr.indexOf(endingExpression) + endingExpression.length];
                // var parts = catchExpression.exec(activeStr);
                var loopLength = getLoopLength(val, item);
                if(loopLength && endingPart[0] > -1 && endingPart[1] > -1){
                  var opening = activeStr.substring(openingPart[0], openingPart[1]),
                      content = activeStr.substring(contentPart[0], contentPart[1]),
                      ending = activeStr.substring(endingPart[0], endingPart[1]);

                  activeStr = activeStr.replace(opening, '').replace(ending, '');
                  var newExpression = substituteLoopVals(content, val, loopLength);
                  activeStr = activeStr.replace(content, newExpression);
                }else{
                  activeStr = activeStr.replace(opening, '').replace(ending, '').replace(content, '');
                }
            break;

            //replace by value
            case 'set':
              if(val != 'endif'){
                  var newVal = fetchVal(val, item);
                  matching = new RegExp(matching, 'g');
                  // console.log('set', val, 'from', matching, ' to ', newVal);
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

    factory.init = function(models){
      templateModels = {};
      for(var i in models){
        templateModels[i] = models[i].path;
      }
    }

    return factory;
  });

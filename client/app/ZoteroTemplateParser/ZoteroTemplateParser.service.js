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

    var findValInItem = function(val, item){
      var templatePath = templatesModels[val],
        cursor = item,
        prop;
      for(var i in templatePath){
        prop = templatePath[i];
        cursor = cursor[prop];
        if(!cursor)
          break;
      }
      return cursor;
    };

    var fetchVal = function(val, item){
      var n = findValInItem(val, item);
      return (n)?n:'';
    };

    var checkVal = function(val, item){
      return (findValInItem(val,item))?true:false;
    };

    var populateTemplate = function(template, item){
        //var r = /\$(\w+):(\w+)\$/gi;
      var r = /\$(\w+):?(\w+)?\$/gi;
        var line = template;
      var matches = line.match(r);
      if(matches){
        for(var i in matches){
          r.exec('');
          var expressions = r.exec(matches[+i]);
          var statement = expressions[1];
          var val = expressions[2];
                var matching = new RegExp('\\\$'+statement+':'+val+'\\\$', 'g');
                //case of implicit 'set'
                if(!val){
                    val = expressions[1];
                    statement = 'set';
                    matching = new RegExp('\\\$'+val+'\\\$', 'g');
                }
          switch(statement){
                    //conditionnal
                    case 'if':
                        var catchExpression = new RegExp('(\\\$'+statement+':'+val+'\\\$)[\\\s|\\\w|\\\S]*(\\\$endif\\\$)', 'gi');
                        var catchAll = new RegExp('(\\\$'+statement+':'+val+'\\\$[\\\s|\\\w|\\\S]*\\\$endif\\\$)', 'gi');
                        var toDelete = (checkVal(val, item))?catchExpression.exec(line):catchAll.exec(line);
                        if(toDelete){
                            line = line.replace(toDelete[1], '').replace(toDelete[2], '');
                        }
                    break;

              //replace by value
                    case 'set':
                        if(val != 'endif'){
                            var newVal = fetchVal(val, item);
                            line = line.replace(matching, newVal);
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
            titleVals = line.match(titleMatch);
        if(titleVals){
            line = line.replace(titleMatch, '');
            var values = titleValsMatch.exec(titleVals[0]);
            title = values[2];
        };
      return {
                    body : line,
                    filename : title
                };
    };

    factory.parseZoteroItemWithTemplate = function(template, item){
      return populateTemplate(template, item);
    };

    return factory;
  });

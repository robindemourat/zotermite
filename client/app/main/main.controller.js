'use strict';


angular.module('zotermiteApp')
  .controller('MainCtrl', function ($scope, $cookieStore, $log, $http, $timeout, ZoteroQueryHandler, ZoteroQueryBuilder, ZoteroTemplateParser, FileDownload, codemirrorMarkdown, FileUploader) {
    var query;

    var initVariables = function(){

      $scope.overallItems = [];
      $scope.selectedItems = [];
      $scope.exportAsList = false;

      $scope.inputAPIkey = "";
      $scope.inputUserId = "";


      var retrievedUserId = $cookieStore.get('zoteroUserId');
      var retrievedAPIkey = $cookieStore.get('zoteroAPIkey');

      $scope.connectingZotero = true;

      if(retrievedUserId && retrievedAPIkey){
        $scope.userId = retrievedUserId;
        $scope.apiKey = retrievedAPIkey;
        $scope.inputUserId = $scope.userId;
        $scope.inputAPIkey = $scope.apiKey;
        $scope.rememberCredentials = true;
        $scope.setZoteroCredentials($scope.apiKey, $scope.userId);
      }else{
        $scope.rememberCredentials = false;
      }

      //markdown-template editor
       $scope.editorOptions = {
            lineWrapping : true,
            lineNumbers: false,
            mode: 'markdown'
        };

        //Interface;
        $scope.asides = {
          left : false,
          right : false
        }

        $scope.templateChoose = true;
        $scope.leftMenuMode = 'about';

        $scope.sortAscending = true;
        $scope.sortMode = 'title';


        //get zotero-to-zfm
        $http
          .get('api/models')
          .success(function(models){
            $scope.templateModels = models;
            ZoteroTemplateParser.init(models);
          })
    };

    $scope.setLeftMenuContent = function(mode){
      if(mode === 'about'){
        return 'assets/html/menu-about.html';
      } else if ( mode === 'syntax' ){
        return 'assets/html/menu-syntax.html';
      } else if ( mode === 'vocab' ){
        return 'assets/html/menu-vocab.html';
      } else if ( mode === 'connect'){
        return 'assets/html/menu-help-connect.html';
      }
    }

    $scope.setZoteroCredentials = function(apiKey, userId){
      if(apiKey.length === 0 || !userId.length === 0){
        return;
      }
      if($scope.userId === userId && $scope.apiKey === apiKey && $scope.overallItems.length){
        $scope.connectingZotero = false;
        return;
      }
      $scope.connectingZotero = true;
      $scope.zoteroPending = true;
      $scope.zoteroStatus = 'Connecting to zotero ...';
      query = ZoteroQueryBuilder.init(apiKey, userId).searchItemType('-attachment');
      $scope.overallQueryStart = 0;
      $scope.getMore(function(err, data){
        $scope.zoteroPending = false;
        $scope.zoteroStatus = undefined;
        if(err){
          $scope.zoteroStatus = 'Could not connect to Zotero : '+err;
        }else{
          $scope.userId = userId;
          $scope.apiKey = apiKey;
          $scope.inputUserId = userId;
          $scope.inputAPIkey = apiKey;
          if($scope.rememberCredentials){
            $cookieStore.put('zoteroUserId', userId);
            $cookieStore.put('zoteroAPIkey', apiKey);
          }else{
            $cookieStore.remove('zoteroUserId');
            $cookieStore.remove('zoteroAPIkey');
          }

          $scope.alerts = [];
          $scope.connectingZotero = false;
          setTimeout(function(){
            $scope.$apply();
          })
        }
      });
    }

    $scope.setDefaultZoteroCredentials = function(){
      $http.get('assets/default-credentials/zotero-credentials.json')
        .success(function(credentials){
          $scope.setZoteroCredentials(credentials.apiKey, credentials.userId);
        }).error(function(){
            $log.error('credentials not found. Write them in root/credentials/credentials.json with an object containing properties userId and apiKey, or paste your API in the interface.')
        });
    }

    $scope.toggleLeftMenuMode = function(val){
      $scope.leftMenuMode = val;
    }

    $scope.toggleTemplateChoose = function(oneSide){
      if(oneSide){
        if(!$scope.templateChoose){
          $scope.templateChoose = true;
        }
      }else{
        $scope.templateChoose = !$scope.templateChoose;
      }
    }

    $scope.toggleZoteroConnect = function(){
      if($scope.connectingZotero && $scope.apiKey && $scope.userId){
        $scope.connectingZotero = false;
      }else if(!$scope.connectingZotero){
        $scope.connectingZotero = !$scope.connectingZotero;
      }
    }

    $scope.toggleAside = function(side){
      var otherSide = (side === 'left')?'right' : 'left';
      $scope.asides[side] = !$scope.asides[side];
      if($scope.asides[side]){
        $scope.asides[otherSide] = false;
      }


      setTimeout(function(){
        $scope.$apply();
      });
    }

    $scope.setZoteroItemIcon = function(type){
      switch(type){
        case 'book':
        return 'glyphicon-book';
        break;

        case 'bookSection':
        return 'glyphicon-bookmark';
        break;

        case 'journalArticle':
        return 'glyphicon-calendar';
        break;

        case 'thesis':
        return 'glyphicon-education';
        break;

        case 'conferencePaper':
        return 'glyphicon-comment';
        break;

        case 'webpage':
        return 'glyphicon-globe';
        break;

        default:
        return 'glyphicon-file';
        break;
      }
    }

    $scope.setBigContainerClass = function(){
      var clas = '';
      if($scope.asides.left){
        clas += 'left';
      } else if ( $scope.asides.right ){
        clas += 'right';
      }
      return clas;
    }

    var preparePreview = function(template, collection){
      var output = '';

      if(collection.length){
        for(var i in collection){
          var data = ZoteroTemplateParser.parseZoteroItemWithTemplate(template, collection[i]);
         output += data.body + '\n\n';
         // output += '\nFilename \n**************\n>'+data.filename + '.md\n**************\nContent\n**************\n'+data.body + '\n**************\n';
        }
      }else{
        var data = ZoteroTemplateParser.parseZoteroItemWithTemplate(template, collection);
        output += data.body;
        // output += 'Filename \n**************\n>'+data.filename + '.md\n**************\nContent\n**************\n'+data.body;
      }
      return output;
    }

    var updatePreview = function(template){
      if(!template|| !$scope.overallItems || !$scope.selectedItems)
        return;
      else if($scope.selectedItems.length == 0 && $scope.overallItems.length > 0){
        $scope.processedPreview = preparePreview($scope.activeTemplate, $scope.overallItems[0]);
      }else{
        $scope.processedPreview = preparePreview($scope.activeTemplate, $scope.selectedItems);
      }

      /*if($scope.processedPreview){
        $scope.displayedPreview = $scope.processedPreview;
      }*/
    };

    var initWatchers = function(){
      $scope.$watch('activeTemplate', updatePreview);
      $scope.$watchCollection('selectedItems', updatePreview);
      $scope.$watchCollection('overallItems', updatePreview);

    };

    var itemExists = function(item, collection){
      for(var i in collection){
        if(collection[i].key === item.key)
          return true;
      }
      return false;
    };

    var findItem = function(item, collection){
      for(var i in collection){
        if(collection[i].key === item.key)
          return i;
      }
    };

    var appendToListOfItems = function(err, d){
      $scope.zoteroPending = false;
      for(var i in d){
        var item = d[i];
        if(!itemExists(item, $scope.overallItems))
          $scope.overallItems.push(item);
      }
    }

    var prependToListOfItems = function(err, d){
      $scope.zoteroPending = false;
      for(var i in d){
        var item = d[i];
        if(!itemExists(item, $scope.overallItems)){
          if($scope.overallItems)
            $scope.overallItems.unshift(item);
        }
      }
    };


    var sortSelectedItems = function(){
      if(!angular.isDefined($scope.sortMode) || !angular.isDefined($scope.sortAscending)){
        return;
      }else{
        var before = $scope.sortAscending,
            after = !$scope.sortAscending,
            equal = 0;

        $scope.selectedItems = $scope.selectedItems.sort(function(a,b){
          switch($scope.sortMode){
            case 'title':
              var title1 = a.data.title,
                  title2 = b.data.title;

              if(title1 > title2){
                return before;
              }else if(title1 < title2){
                return after;
              }else return equal;
            break;

            case 'firstAuthor':
              var author1 = a.data.creators[0],
                  author2 = b.data.creators[0];

              if(!author1){
                return after;
              }else if(!author2){
                return before;
              }

              author1 = author1.lastName;
              author2 = author2.lastName;

              if(author1 > author2){
                return after;
              }else if(author1 < author2){
                return before;
              }else return equal;
            break;

            case 'year':
              var date1 = a.data.date,
                  date2 = b.data.date;

              if(!date1){
                return after;
              }else if(!date2){
                return before;
              }

              var year1 = date1.match(/[\d]{4}/),
                  year2 = date2.match(/[\d]{4}/);

              if(!year1){
                return after;
              }else if(!year2){
                return before;
              }

              if(+year1[0] > +year2[0]){
                return before;
              }else if(+year1[0] < +year2[0]){
                return after;
              }else return equal;
            break;

            default:
              return 1;
            break;
          }
        });
      }
    }

    $scope.setSortMode = function(mode){
      $scope.sortMode = mode;
      console.log('new sort mode : ', $scope.sortMode, ', sort ascending :', $scope.sortAscending);
      sortSelectedItems();
      setTimeout(function(){
        $scope.$apply();
      });
    }

    $scope.setSortAscending = function(ascending){
      $scope.sortAscending = ascending;
      setTimeout(function(){
        $scope.$apply();
        sortSelectedItems();
      });
    }

    $scope.addToSelected = function(index){
      var d = $scope.overallItems[index];
      if(!itemExists(d, $scope.selectedItems)){
        $scope.selectedItems.push($scope.overallItems[index]);
        sortSelectedItems();
      }
    };

    $scope.removeFromSelected = function(index){
      $scope.selectedItems.splice(index, 1);
        sortSelectedItems();
    };

    $scope.clearAllSelected = function(){
      $scope.selectedItems = [];
    }

    $scope.getMore = function(callback){
      $scope.zoteroPending = true;

      if($scope.searchQuery){
        if($scope.searchQuery.length == 0){
          query.quickSearch(null);
        }
        else{
          $scope.newZoteroQuery($scope.searchQuery);
        }
      }

      query.start($scope.overallQueryStart);
      ZoteroQueryHandler.getItems(query.get(), function(err, data){
        if(data){
          appendToListOfItems(err, data);
        }
        if(callback){
          callback(err, data);
        }
      });
      $scope.overallQueryStart += 100;
    };

    $scope.addAllMatching = function(){
      var matching = $scope.overallItems.filter($scope.searchInItem);
      for(var i in matching){
        var index = findItem(matching[i], $scope.overallItems);
        if(index)
          $scope.addToSelected(index);
      }
    };

    $scope.searchInItem = function(item){
      var match = false;
      if($scope.searchQuery && item.data){
        for(var i in item.data){
          var val = item.data[i];
          if(!val)
            continue;
          else if(typeof val == 'object' && val.length){
            for(var k in val){
              var val2 = val[k];
              if(typeof val2 == 'object'){
                for(var j in val2){
                  if((""+val2[j]).toLowerCase().indexOf($scope.searchQuery.toLowerCase()) > -1){
                    match = true;
                    break;
                }
                }
              }else if((""+val2[j]).toLowerCase().indexOf($scope.searchQuery.toLowerCase()) > -1){
                  match = true;
                  break;
            }
            }
          }else if(typeof val == 'object'){
            for(var j in val){
              if((""+val[j]).toLowerCase().indexOf($scope.searchQuery.toLowerCase()) > -1){
                match = true;
                break;
            }
            }
          }else if((""+val).toLowerCase().indexOf($scope.searchQuery.toLowerCase()) > -1){
                match = true;
                break;
          }
        }
        return match;
      }
      else return true;
    };

    $scope.newZoteroQuery = function(expression, callback){
      $scope.zoteroPending = true;
      query.quickSearch(expression).start(0);
      $log.info('new query to zotero', expression);
      ZoteroQueryHandler.getItems(query.get(), prependToListOfItems);
      // $scope.addAlert('', 'fetching items in zotero, please wait')
    };

    $scope.changeAPIKey = function(apiKey){
      $log.info('new api key', apiKey);
      query.apiKey(apiKey);
    };

    $scope.switchExportAsList = function(exp){
      $scope.exportAsList = exp;
      setTimeout(function(){
        $scope.$apply();
      })
    };

    var downloadFile = function(content, filename){
      FileDownload.download(filename, 'txt', content);
    }

    $scope.downloadItems = function(items){
      if($scope.exportAsList){
        var output = '';
        for(var i in items){
          output += ZoteroTemplateParser.parseZoteroItemWithTemplate($scope.activeTemplate, items[i]).body + '\n\n';
        }
        downloadFile(output, 'zotero_items_list');
      }else{
        for(var i in items){
          var item = items[i];
          var output = ZoteroTemplateParser.parseZoteroItemWithTemplate($scope.activeTemplate, item);
          $timeout(function(){
              $log.info('downloading file'+output.filename);
              downloadFile(output.body, output.filename)
          }, i*5000);
        }
      }
    };

    $scope.downloadActiveTemplate = function(){
      downloadFile($scope.activeTemplate, 'my_zotermite_template');
    }

    $scope.copyToClipboard = function(items){
      console.info('copying items to clipboard ', items);
      var output = "";
      for(var i in items){
        output += ZoteroTemplateParser.parseZoteroItemWithTemplate($scope.activeTemplate, items[i]).body + '\n\n';
      }

      $log.info('processed result copied to clipboard');
      return output;
    };



    var acceptedImportExts = ['txt', 'md'];
    $scope.uploader = new FileUploader({
        filters: [{
            name: 'fileType',
            // A user-defined filter
            fn: function(item) {
              var extension = item.name.split('.')[item.name.split('.').length - 1], valid = false;
              for(var i in acceptedImportExts){
                if(acceptedImportExts[i] == extension){
                  valid = true;
                }
              }
              if(valid)
                  return true;
            }
        }]
    });

    $scope.uploader.onAfterAddingFile = function(file){
      var fR = new FileReader(),
          extension = file._file.name.split('.')[file._file.name.split('.').length - 1],
          result = {};
      fR.addEventListener("load", function(event) {
          var textFile = event.target,
              raw = textFile.result;
          var ok = typeof raw === 'string' && raw.length > 0;
          if(ok){
            $scope.loadedTemplate = {
              title : 'custom template',
              content : raw
            };
          $scope.activeTemplate = raw;
          $scope.templateChoose = false;
            $scope.$apply();
          }
      });

      //Read the text file
      fR.readAsText(file._file);
    }

    /*
    API Dialog
    */
    $scope.getTemplatesList = function(){
      $http.get('/api/templates/')
        .success(function(templates){
          console.info('ok', templates);
          $scope.templates = templates;
        })
    }

    $scope.getTemplate = function(name){
      $http
        .get('/api/templates/'+name)
        .success(function(template){
          $scope.loadedTemplate = template;
          $scope.activeTemplate = template.content;
          $scope.templateChoose = false;

          setTimeout(function(){
            $scope.$apply();
          })
        });
    }

    $scope.getTemplatesList();
    // $scope.getTemplate('fiche');


    initVariables();
    initWatchers();
  });

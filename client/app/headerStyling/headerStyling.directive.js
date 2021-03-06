'use strict';

angular.module('zotermiteApp')
  .directive('headerStyling', function ($window) {
    return {
      restrict: 'A',
      scope : {
        headerStyling : '='
      },
      link: function (scope, element, attrs) {
        var doc = angular.element($window);
        var resize = function(){
          var height = doc.height();
          scope.headerStyling = '.moving-header{height:'+height+'px;line-height:'+height+'px}';
        }

        doc.on('resize', resize);
        scope.$on('$destroy', function(){
          doc.off('resize', resize);
        });
        resize();
      }
    };
  });

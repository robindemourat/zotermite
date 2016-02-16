'use strict';

angular.module('zotermiteApp')
  .directive('fitHeight', function ($window, $timeout, $document) {
    return {
      restrict: 'AC',
      scope : {
        parentSelector : "@fitHeight"
      },
      link: function postLink(scope, element, attrs) {
        var elementTop,
            elementHeight,
            next,
            nextTop,
            parent,
            parentHeight;

        var resize = function(){
          if(scope.parentSelector){
            $timeout(function(){
              parent = angular.element($document).find(scope.parentSelector);
              element.height(parent.height());
            });
          }else if(angular.isDefined(attrs['fitToParent'])){
            elementTop = element.position().top;
            parentHeight = element.parent().height();
            element.height(parentHeight - elementTop);
          }else{
            elementTop = element.position().top;
            elementHeight = element.height();
            next = element.next();
            nextTop = next.position().top;
            if(nextTop == 0){
              return $timeout(resize);
            }
            element.height(nextTop - elementTop);
          }
        }

        angular.element($window).on('resize', resize);
        resize();
        scope.$on('$destroy', function(){
          angular.element($window).off('resize', resize);
        })

      }
    };
  });



angular.module('ui.scrollspy', []).

service('scrollspyService', [
  function($window) {
    var openScopes = [], lastKey = -1, lastTarget = '';

    this.process = function($scope) {
      openScopes.push($scope);
    };

    this.activate = function(targetElement) {
      try {
        angular.element(targetElement).addClass('active');

        var id = angular.element(targetElement).attr('id');
        if (id) {
          angular.forEach(document.getElementsByTagName('a'), function(el) {
            if (angular.element(el).attr('href') === '#' + id) {
              angular.element(el).parent().addClass('active');
            }
          });      
        }

      } catch(e) {}
    };

    this.deactivate = function(targetElement) {
      try {
        angular.element(targetElement).removeClass('active');

        var id = angular.element(targetElement).attr('id');
        if (id) {
          angular.forEach(document.getElementsByTagName('a'), function(el) {
            if (angular.element(el).attr('href') === '#' + id) {
              angular.element(el).parent().removeClass('active');
            }
          });      
        }
      } catch(e) {}
    };


    angular.element(window).bind('scroll', function() {
      if (openScopes.length === 0) return;

      var scrollTop = window.scrollY + window.screen.height/3,
      startKey = openScopes.length;
      
      if (lastKey !== -1 && scrollTop < openScopes[lastKey].offsetTop) startKey = lastKey;
      for (var key = startKey; key --;) {
        if (scrollTop >= openScopes[key].offsetTop) {
          if (lastTarget === openScopes[key].target) break;

          if (lastKey !== -1) {
            openScopes[lastKey].$apply(function() {
              openScopes[lastKey].isActive = false;
            });
          }

          openScopes[key].$apply(function() {
            openScopes[key].isActive = true;
          });
          
          lastTarget = openScopes[key].target;
          lastKey = key;
          break;
        }
      }
    }).triggerHandler('scroll');
  }
]).

controller('Scrollspy', [
  '$scope',
  'scrollspyService',
  function($scope, scrollspyService) {
    var self = this;

    $scope.target = '';
    $scope.isActive = false;
    $scope.offsetTop = 0;

    scrollspyService.process($scope);

    $scope.$watch('isActive', function() {
      if ($scope.isActive) scrollspyService.activate($scope.target);
      else scrollspyService.deactivate($scope.target);
    });
  }
]).

directive('scrollspy', [
  'scrollspyService',
  function(scrollspyService) {'use strict';
    return {
      controller: 'Scrollspy',
      scope: {
        target: '=?',
        isActive: '=?',
        offsetTop: '=?'
      },
      link: function($scope, $element, $attrs, ctrl) {
        if (! ctrl) return;

        $scope.isActive = $element.hasClass('active');
        $scope.target = $element[0];
        $scope.offsetTop = $element[0].offsetTop;
      }
    };
  }
]).

directive('scrollspyTab', [
  '$location', '$anchorScroll',
  'scrollspyService',
  function($location, $anchorScroll, scrollspyService) {'use strict';
    return {
      link: function($scope, $element, $attrs) {
        $element.on('click', function(event) {
          event.preventDefault();
          event.stopPropagation();

          var id = $attrs.href.replace('#', '');
          $location.hash(id);
          $anchorScroll();
        });
      }
    };
  }
]);
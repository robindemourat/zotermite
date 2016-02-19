'use strict';

describe('Directive: headerStyling', function () {

  // load the directive's module
  beforeEach(module('zotermiteApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<header-styling></header-styling>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the headerStyling directive');
  }));
});
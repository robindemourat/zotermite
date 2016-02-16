'use strict';

describe('Service: codemirrorMarkdown', function () {

  // load the service's module
  beforeEach(module('zotermiteApp'));

  // instantiate service
  var codemirrorMarkdown;
  beforeEach(inject(function (_codemirrorMarkdown_) {
    codemirrorMarkdown = _codemirrorMarkdown_;
  }));

  it('should do something', function () {
    expect(!!codemirrorMarkdown).toBe(true);
  });

});

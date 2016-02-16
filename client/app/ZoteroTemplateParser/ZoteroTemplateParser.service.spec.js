'use strict';

describe('Service: ZoteroTemplateParser', function () {

  // load the service's module
  beforeEach(module('zotermiteApp'));

  // instantiate service
  var ZoteroTemplateParser;
  beforeEach(inject(function (_ZoteroTemplateParser_) {
    ZoteroTemplateParser = _ZoteroTemplateParser_;
  }));

  it('should do something', function () {
    expect(!!ZoteroTemplateParser).toBe(true);
  });

});

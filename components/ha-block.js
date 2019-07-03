'use strict'
polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details')
});

var Handlebars = require('handlebars');

Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});

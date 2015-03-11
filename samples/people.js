var _ = require('lodash');

module.exports = function(event, done) {

  return Hoist.connector("<key>")
    .get('people.xml')
    .then(function(people) {
      _.each(people, function(p) {
        Hoist.event.raise('CONTACT:FOUND', p);
      });
    })

}
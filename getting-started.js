/* Just copy and paste this snippet into your code */

module.exports = function (event, done) {

  /* For yourself */
  var highrise = Hoist.connector('<key>');
  highrise.get('/people')
    .then(function (people) {
      var promises = [];
      for (var index = 0; index < people.length; index++) {
        promises.push(Hoist.event.raise('person:found', people[index]));
      }
      return Hoist.promise.all(promises);
    })
    .then(done);

  /* For your users */
  var highrise = Hoist.connector('<key>');
  highrise.authorize('token')
    .get('/people')
    .then(function (people) {
      var promises = [];
      for (var index = 0; index < people.length; index++) {
        promises.push(Hoist.event.raise('person:found', people[index]));
      }
      return Hoist.promise.all(promises);
    })
    .then(done);

};
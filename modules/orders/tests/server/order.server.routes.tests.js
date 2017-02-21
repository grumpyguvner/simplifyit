'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Order = mongoose.model('Order'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  order;

/**
 * Order routes tests
 */
describe('Order CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      usernameOrEmail: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.usernameOrEmail,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new order
    user.save(function () {
      order = {
        title: 'Order Title',
        content: 'Order Content'
      };

      done();
    });
  });

  it('should not be able to save an order if logged in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/orders')
          .send(order)
          .expect(403)
          .end(function (orderSaveErr, orderSaveRes) {
            // Call the assertion callback
            done(orderSaveErr);
          });

      });
  });

  it('should not be able to save an order if not logged in', function (done) {
    agent.post('/api/orders')
      .send(order)
      .expect(403)
      .end(function (orderSaveErr, orderSaveRes) {
        // Call the assertion callback
        done(orderSaveErr);
      });
  });

  it('should not be able to update an order if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/orders')
          .send(order)
          .expect(403)
          .end(function (orderSaveErr, orderSaveRes) {
            // Call the assertion callback
            done(orderSaveErr);
          });
      });
  });

  it('should be able to get a list of orders if not signed in', function (done) {
    // Create new order model instance
    var orderObj = new Order(order);

    // Save the order
    orderObj.save(function () {
      // Request orders
      request(app).get('/api/orders')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single order if not signed in', function (done) {
    // Create new order model instance
    var orderObj = new Order(order);

    // Save the order
    orderObj.save(function () {
      request(app).get('/api/orders/' + orderObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', order.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single order with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/orders/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Order is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single order which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent order
    request(app).get('/api/orders/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No order with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should not be able to delete an order if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/orders')
          .send(order)
          .expect(403)
          .end(function (orderSaveErr, orderSaveRes) {
            // Call the assertion callback
            done(orderSaveErr);
          });
      });
  });

  it('should not be able to delete an order if not signed in', function (done) {
    // Set order user
    order.user = user;

    // Create new order model instance
    var orderObj = new Order(order);

    // Save the order
    orderObj.save(function () {
      // Try deleting order
      request(app).delete('/api/orders/' + orderObj._id)
        .expect(403)
        .end(function (orderDeleteErr, orderDeleteRes) {
          // Set message assertion
          (orderDeleteRes.body.message).should.match('User is not authorized');

          // Handle order error error
          done(orderDeleteErr);
        });

    });
  });

  it('should be able to get a single order that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      usernameOrEmail: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin']
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new order
          agent.post('/api/orders')
            .send(order)
            .expect(200)
            .end(function (orderSaveErr, orderSaveRes) {
              // Handle order save error
              if (orderSaveErr) {
                return done(orderSaveErr);
              }

              // Set assertions on new order
              (orderSaveRes.body.title).should.equal(order.title);
              should.exist(orderSaveRes.body.user);
              should.equal(orderSaveRes.body.user._id, orphanId);

              // force the order to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the order
                    agent.get('/api/orders/' + orderSaveRes.body._id)
                      .expect(200)
                      .end(function (orderInfoErr, orderInfoRes) {
                        // Handle order error
                        if (orderInfoErr) {
                          return done(orderInfoErr);
                        }

                        // Set assertions
                        (orderInfoRes.body._id).should.equal(orderSaveRes.body._id);
                        (orderInfoRes.body.title).should.equal(order.title);
                        should.equal(orderInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single order if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new order model instance
    var orderObj = new Order(order);

    // Save the order
    orderObj.save(function () {
      request(app).get('/api/orders/' + orderObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', order.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single order, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'orderowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Order
    var _orderOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _orderOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Order
      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = _user._id;

          // Save a new order
          agent.post('/api/orders')
            .send(order)
            .expect(200)
            .end(function (orderSaveErr, orderSaveRes) {
              // Handle order save error
              if (orderSaveErr) {
                return done(orderSaveErr);
              }

              // Set assertions on new order
              (orderSaveRes.body.title).should.equal(order.title);
              should.exist(orderSaveRes.body.user);
              should.equal(orderSaveRes.body.user._id, userId);

              // now signin with the test suite user
              agent.post('/api/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the order
                  agent.get('/api/orders/' + orderSaveRes.body._id)
                    .expect(200)
                    .end(function (orderInfoErr, orderInfoRes) {
                      // Handle order error
                      if (orderInfoErr) {
                        return done(orderInfoErr);
                      }

                      // Set assertions
                      (orderInfoRes.body._id).should.equal(orderSaveRes.body._id);
                      (orderInfoRes.body.title).should.equal(order.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (orderInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Order.remove().exec(done);
    });
  });
});

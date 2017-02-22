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
describe('Order Admin CRUD tests', function () {
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
      roles: ['user', 'admin'],
      username: credentials.usernameOrEmail,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new order
    user.save(function () {
      order = {
        orderRef: 'Order Reference',
        content: 'Order Content'
      };

      done();
    });
  });

  it('should be able to save an order if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new order
        agent.post('/api/orders')
          .send(order)
          .expect(200)
          .end(function (orderSaveErr, orderSaveRes) {
            // Handle order save error
            if (orderSaveErr) {
              return done(orderSaveErr);
            }

            // Get a list of orders
            agent.get('/api/orders')
              .end(function (ordersGetErr, ordersGetRes) {
                // Handle order save error
                if (ordersGetErr) {
                  return done(ordersGetErr);
                }

                // Get orders list
                var orders = ordersGetRes.body;

                // Set assertions
                (orders[0].user._id).should.equal(userId);
                (orders[0].orderRef).should.match('Order Reference');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to update an order if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new order
        agent.post('/api/orders')
          .send(order)
          .expect(200)
          .end(function (orderSaveErr, orderSaveRes) {
            // Handle order save error
            if (orderSaveErr) {
              return done(orderSaveErr);
            }

            // Update orderRef
            order.orderRef = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing order
            agent.put('/api/orders/' + orderSaveRes.body._id)
              .send(order)
              .expect(200)
              .end(function (orderUpdateErr, orderUpdateRes) {
                // Handle order update error
                if (orderUpdateErr) {
                  return done(orderUpdateErr);
                }

                // Set assertions
                (orderUpdateRes.body._id).should.equal(orderSaveRes.body._id);
                (orderUpdateRes.body.orderRef).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an order if no orderRef is provided', function (done) {
    // Invalidate orderRef field
    order.orderRef = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new order
        agent.post('/api/orders')
          .send(order)
          .expect(422)
          .end(function (orderSaveErr, orderSaveRes) {
            // Set message assertion
            (orderSaveRes.body.message).should.match('OrderRef cannot be blank');

            // Handle order save error
            done(orderSaveErr);
          });
      });
  });

  it('should be able to delete an order if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new order
        agent.post('/api/orders')
          .send(order)
          .expect(200)
          .end(function (orderSaveErr, orderSaveRes) {
            // Handle order save error
            if (orderSaveErr) {
              return done(orderSaveErr);
            }

            // Delete an existing order
            agent.delete('/api/orders/' + orderSaveRes.body._id)
              .send(order)
              .expect(200)
              .end(function (orderDeleteErr, orderDeleteRes) {
                // Handle order error error
                if (orderDeleteErr) {
                  return done(orderDeleteErr);
                }

                // Set assertions
                (orderDeleteRes.body._id).should.equal(orderSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single order if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new order model instance
    order.user = user;
    var orderObj = new Order(order);

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new order
        agent.post('/api/orders')
          .send(order)
          .expect(200)
          .end(function (orderSaveErr, orderSaveRes) {
            // Handle order save error
            if (orderSaveErr) {
              return done(orderSaveErr);
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
                (orderInfoRes.body.orderRef).should.equal(order.orderRef);

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                (orderInfoRes.body.isCurrentUserOwner).should.equal(true);

                // Call the assertion callback
                done();
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

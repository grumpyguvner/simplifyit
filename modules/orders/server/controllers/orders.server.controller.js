'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Order = mongoose.model('Order'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an order
 */
exports.create = function (req, res) {
  var order = new Order(req.body);
  order.user = req.user;

  order.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(order);
    }
  });
};

/**
 * Show the current order
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var order = req.order ? req.order.toJSON() : {};

  // Add a custom field to the Order, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Order model.
  order.isCurrentUserOwner = !!(req.user && order.user && order.user._id.toString() === req.user._id.toString());

  res.json(order);
};

/**
 * Update an order
 */
exports.update = function (req, res) {
  var order = req.order;

  order.orderRef = req.body.orderRef;
  order.content = req.body.content;
  order.poRef = req.body.poRef;

  order.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(order);
    }
  });
};

/**
 * Delete an order
 */
exports.delete = function (req, res) {
  var order = req.order;

  order.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(order);
    }
  });
};

/**
 * List of Orders
 */
exports.list = function (req, res) {
  Order.find().sort('-created').populate('user', 'displayName').exec(function (err, orders) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(orders);
    }
  });
};

/**
 * Order middleware
 */
exports.orderByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Order is invalid'
    });
  }

  Order.findById(id).populate('user', 'displayName').exec(function (err, order) {
    if (err) {
      return next(err);
    } else if (!order) {
      return res.status(404).send({
        message: 'No order with that identifier has been found'
      });
    }
    req.order = order;
    next();
  });
};

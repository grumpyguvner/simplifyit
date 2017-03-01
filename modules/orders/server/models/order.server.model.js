'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Order Schema
 */
var OrderSchema = new Schema({
  orderRef: {
    type: String,
    default: '',
    trim: true,
    required: 'Order Reference cannot be blank'
  },
  customer: {
    type: Schema.ObjectId,
    ref: 'Contact'
  },
  content: {
    type: String,
    default: '',
    trim: true
  },
  poRef: {
    type: String,
    default: '',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Order', OrderSchema);

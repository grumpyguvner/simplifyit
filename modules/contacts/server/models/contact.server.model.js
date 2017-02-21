'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Contact Schema
 */
var ContactSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    default: '',
    validate: 'First name is required'
  },
  lastName: {
    type: String,
    trim: true,
    default: '',
    validate: 'Last name is required'
  },
  displayName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    index: {
      unique: true,
      sparse: true // For this to work on a previously indexed field, the index must be dropped & the application restarted.
    },
    lowercase: true,
    trim: true,
    default: '',
    validate: 'Email address is required'
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

mongoose.model('Contact', ContactSchema);


const serverless = require('serverless-http')
const express = require("express");

// Adds environment variables from .env into process.env (node environment)
require('dotenv').config();

const authController = require('../../controllers/auth.js');
const messagesController = require('../../controllers/messages.js');

// Require express framework -> Provides broad features for building web and mobile applications
const app = express();

// Allows us to have PUT and DELETE requests made from html forms
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Allow loggin in
const morgan = require('morgan');

//  Allows the creation and storage of the session data used for authentication or user preferences
const session = require('express-session');

// Built-in module that provides utilities for working with file and directory paths
const path = require("path");

// Library to hash a password
const bcrypt = require("bcrypt");

// Connection to mongoose database
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

// Allows request.body object to be read in the handlers
app.use(express.json());

// Tell express to expect data from our form -> Remove data from url and put into request body
app.use(express.urlencoded({ extended: false }));

// Adding css
app.use(express.static("public"));

// Creating a session (cookie) for authentication and authorization
// Every request from a client will create a session and attatch it to HTTP headers
// These cookies are only alive when the server is running
// These cookies exist regardless of the user being signed in
app.use(
    session({
      secret: process.env.SECRET_PASSWORD, // Replace with a strong secret key
      resave: false, // Forces the session to be saved back to the store, even if it wasn't modified
      saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store
      cookie: { secure: false }, // Secure should be true in production if you're using HTTPS
    })
);

// Enables function globally in the browser
app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    next();
});

// Accessing the controllers to enable HTTP requests (get, post, put and delete)
app.use('/auth', authController);
app.use('/messages', messagesController);

// Landing page
app.get('/', (req, res) => {
    res.render('home.ejs', {
      user: req.session.user,
    });
});

module.exports.handler = serverless(app)
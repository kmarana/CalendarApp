var express = require('express');
require('mongodb');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
var ObjectID = require('mongodb').ObjectId;
const crypto = require('crypto');
var router = express.Router();

exports.setApp = function (app, client) {

  //++++++++++++++++++++User APIs++++++++++++++++++++
  app.post('/api/login', async (req, res, next) => {
    // incoming: login, password
    // outgoing: id, firstName, lastName, error

    const { login, password } = req.body;

    const db = client.db("myDB");
    const results = await
      db.collection('Users').find({ Login: login, Password: password }).toArray();

    var id = "";
    var fn = '';
    var ln = '';
    var error = '';

    var ret;

    if (results.length > 0) {
      id = results[0]._id;
      fn = results[0].FirstName;
      ln = results[0].LastName;

      try {
        const token = require("./createJWT.js");
        ret = token.createToken(fn, ln, id);
      }
      catch (e) {
        ret = { error: e.message };
      }
    }

    else {
      ret = { error: "Login/Password incorrect" };
    }

    //ret = { id:id, firstName:fn, lastName:ln, error:''};
    res.status(200).json(ret);
  });

  app.post('/api/register', async (req, res, next) => {
    // incoming: fn, ln, login, password, email
    // outgoing: error

    const { fn, ln, login, password, email } = req.body;


    const newUser = {
      FirstName: fn,
      LastName: ln,
      Login: login,
      Password: password,
      email: email,
      emailToken: crypto.randomBytes(64).toString('hex'),
      isVerified: false
    };

    let error = '';
    var ret;

    try {
      const db = client.db("myDB");
      const result = db.collection('Users').insertOne(newUser);
    }

    catch (e) {
      error = e.toString();
    }

    //Need to work on dynamic base URL for email links.
    //if testing on localhost replace both links with: http://localhost:3000/emailVerif?token=${newUser.emailToken}
    const msg = {
      to: email,
      from: "hello@4331cop.com",
      subject: "verify your email",
      text: `Hello, thank you for registering to <CALENDAR APP> 
          Please copy and paste the address below to verify your account
          http://myapp-calendar.herokuapp.com/emailVerif?token=${newUser.emailToken}`,
      html: `<h1> Hello, <h1>
            <p> Thank you for registering on our site</p>
            <p> please click the link below to verify your account.</p>
            <a href=http://myapp-calendar.herokuapp.com/emailVerif?token=${newUser.emailToken}>Verify account</a>`,
    }

    try {
      await sgMail.send(msg)
      ret = { emailToken: newUser.emailToken, error: error };
    }
    catch (e) {
      error = e.toString();
      ret = { error: error };
    }

    res.status(200).json(ret);
  });

  app.post('/api/emailVerif', async (req, res, next) => {
    const { emailToken } = req.body;
    const db = client.db("myDB");
    let user;
    let error = '';
    var ret;

    try {
      user = await db.collection('Users').findOne({ "emailToken": emailToken });
      if (!user) {
        error = 'Verification link is invalid, please resend the email';
        return res.redirect('/');
      }

      const search = { 'emailToken': user.emailToken };
      const updateUser = { $set: { emailToken: null, isVerified: true } };
      user = db.collection('Users').updateOne(search, updateUser);
      ret = { emailToken: user.emailToken, isVerified: user.isVerified, error: error };
    }
    catch (e) {
      error = e.toString();
    }

    res.status(200).json(ret);
  });

  app.post('/api/forgotPassword', async (req, res, next) => {

    const { search } = req.body;

    let error = '';
    let _ret = [];
    const emailToken = crypto.randomBytes(64).toString('hex');
    const db = client.db("myDB");
    var ret;

    try {

      const results = await db.collection('Users').find({ "email": { $eq: search } }).toArray();

      for (var i = 0; i < results.length; i++) {
        _ret.push(results[i]._id);
      }


    }
    catch (e) {
      error = e.toString();
      ret = { error: error };
    }

    const msg = {
      to: search,
      from: "hello@4331cop.com",
      subject: "Password Reset",
      text: `Forgot Password
          We have recieved a request to reset the password for your account.
          To resest password click on the lbutton below.
          http://myapp-calendar.herokuapp.com/passReset?token=${emailToken}`,
      html: `<h1> Hello, <h1>
            <p>  We have recieved a request to reset the password for your account</p>
            <p> please click the link below to reset your password</p>
            <a href=myapp-calendar.herokuapp.com/passReset?token=${emailToken}>Reset Password</a>`,
    }

    try {
      await sgMail.send(msg);
      ret = { results: _ret, emailToken: emailToken, error: error };
    }
    catch (e) {
      error = e.toString();
      ret = { error: error };
    }


    res.status(200).json(ret);
  });

  app.post('/api/resetPassword', async (req, res, next) => {

    var ObjectID = require('mongodb').ObjectId;
    const { _id, password } = req.body;

    let error = '';

    try {

      const search = { '_id': ObjectID(_id) };
      const updatePass = { $set: { Password: password } };

      const db = client.db("myDB");
      const result = db.collection('Users').updateOne(search, updatePass);
    }
    catch (e) {
      error = e.toString();
    }

    var ret = { error: error };
    res.status(200).json(ret);

  });

  //++++++++++++++++++++Calendar APIs++++++++++++++++++++
  app.post('/api/addCalendar', async (req, res, next) => {
    // incoming: userId, calName
    // outgoing: error

    var token = require('./createJWT.js');
    const { userId, calName, jwtToken } = req.body;

    try {
      if (token.isExpired(jwtToken)) {
        var r = { error: 'The JWT is no longer valid', jwtToken: '' };
        res.status(200).json(r);
        return;
      }
    }

    catch (e) {
      console.log(e.message);
    }

    //var uID = { "_id": ObjectID(userId) }
    const newCalendar = { calName: calName, UserId: userId };
    let error = '';

    try {
      const db = client.db("myDB");
      const result = db.collection('Calendars').insertOne(newCalendar);
    }

    catch (e) {
      error = e.toString();
    }

    var refreshedToken = null;
    try {
      refreshedToken = token.refresh(jwtToken);
    }

    catch (e) {
      console.log(e.message);
    }

    var ret = { error: error, jwtToken: refreshedToken };
    res.status(200).json(ret);
  });

  app.post('/api/searchCalendar', async (req, res, next) => {
    // incoming: userId, search
    // outgoing: results[], error
    var token = require('./createJWT.js');
    const { userId, search, jwtToken } = req.body;

    try {
      if (token.isExpired(jwtToken)) {
        var r = { error: 'The JWT is no longer valid', jwtToken: '' };
        res.status(200).json(r);
        return;
      }
    }

    catch (e) {
      console.log(e.message);
    }

    let error = '';
    let _search = search.trim();

    const db = client.db("myDB");
    var uID = { "_id": ObjectID(userId) }
    const results = await db.collection('Calendars').find({ "calName": { $regex: _search + '.*', $options: 'r' }, "UserId": userId }).toArray();

    let _ret = [];
    for (var i = 0; i < results.length; i++) {
      _ret.push(results[i].calName);
    }

    var refreshedToken = null;
    try {
      refreshedToken = token.refresh(jwtToken);
    }
    catch (e) {
      console.log(e.message);
    }

    var ret = { results: _ret, error: error, jwtToken: refreshedToken };
    res.status(200).json(ret);
  });


  app.post('/api/editCalendar', async (req, res, next) => {

    var token = require('./createJWT.js');
    //var ObjectID = require('mongodb').ObjectId;
    const { _id, newName, jwtToken } = req.body;

    try {
      if (token.isExpired(jwtToken)) {
        var r = { error: 'The JWT is no longer valid', jwtToken: '' };
        res.status(200).json(r);
        return;
      }
    }

    catch (e) {
      console.log(e.message);
    }

    let error = '';

    try {

      var search = { '_id': ObjectID(_id) };
      var updateCal = { $set: { calName: newName }, };

      const db = client.db("myDB");
      const result = db.collection('Calendars').updateOne(search, updateCal);
    }
    catch (e) {
      error = e.toString();
    }

    var refreshedToken = null;
    try {
      refreshedToken = token.refresh(jwtToken);
    }
    catch (e) {
      console.log(e.message);
    }

    var ret = { error: error, jwtToken: refreshedToken };
    res.status(200).json(ret);

  });

  app.post('/api/deleteCalendar', async (req, res, next) => {
    var token = require('./createJWT.js');
    var ObjectID = require('mongodb').ObjectId;
    const { _id, jwtToken } = req.body;

    try {
      if (token.isExpired(jwtToken)) {
        var r = { error: 'The JWT is no longer valid', jwtToken: '' };
        res.status(200).json(r);
        return;
      }
    }

    catch (e) {
      console.log(e.message);
    }

    let error = '';
    const delCal = { "_id": ObjectID(_id) };

    try {
      const db = client.db("myDB");
      const result = db.collection('Calendars').deleteOne(delCal);
    }

    catch (e) {
      error = e.toString();
    }

    var refreshedToken = null;
    try {
      refreshedToken = token.refresh(jwtToken);
    }

    catch (e) {
      console.log(e.message);
    }

    var ret = { error: error, jwtToken: refreshedToken };
    res.status(200).json(ret);

  });
  //++++++++++++++++++++Events APIs++++++++++++++++++++
  app.post('/api/addEvents', async (req, res, next) => {
    // incoming: userId, color
    // outgoing: error

    var token = require('./createJWT.js');
    const { userId, calendarID, Title, Description, Location, startDateUTC, endDateUTC,
      isRecurr, frequency, interval, count, jwtToken } = req.body;

    try {
      if (token.isExpired(jwtToken)) {
        var r = { error: 'The JWT is no longer valid', jwtToken: '' };
        res.status(200).json(r);
        return;
      }
    }

    catch (e) {
      console.log(e.message);
    }

    const start = new Date(startDateUTC);
    const end = new Date(endDateUTC)

    const timeDifference = end.getTime() - start.getTime();
    const duration = timeDifference / (1000 * 3600);

    const recPattern = `RRULE:FREQ=${frequency};INTERVAL=${interval};COUNT=${count}`;

    const newEvent = {
      userId: userId, calendarID: calendarID, Title: Title, Description: Description,
      Location: Location, startDateUTC: startDateUTC, endDateUTC: endDateUTC, Duration: duration,
      isRecurr: isRecurr, recurrPattern: recPattern
    };
    let error = '';

    try {
      const db = client.db("myDB");
      const result = db.collection('Events').insertOne(newEvent);
    }

    catch (e) {
      error = e.toString();
    }

    var refreshedToken = null;
    try {
      refreshedToken = token.refresh(jwtToken);
    }

    catch (e) {
      console.log(e.message);
    }

    var ret = { error: error, jwtToken: refreshedToken };
    res.status(200).json(ret);
  });




  app.post('/api/editEvents', async (req, res, next) => {
    // incoming: userId, color
    // outgoing: error



    /*for edit the first steps are the same. check the boolean, do a simple edit if != recurr , 
    else use the user inputted date for an exception date. then use the details for the edit 
    to create a brand new non-recurring event for that one day */

    var token = require('./createJWT.js');
    var ObjectID = require('mongodb').ObjectId;


    const { _id, Title, Description, Location, startDateUTC, endDateUTC,
      isRecurr, frequency, interval, count, exceptionDate, jwtToken } = req.body;

    let error = '';

    const start = new Date(startDateUTC);
    const end = new Date(endDateUTC);

    const timeDifference = end.getTime() - start.getTime();
    const duration = timeDifference / (1000 * 3600);

    let recPattern;

    if (frequency === "") {
      recPattern = "";
    }
    else {
      recPattern = `RRULE:FREQ=${frequency};INTERVAL=${interval};COUNT=${count}`;
    }

    try {
      if (token.isExpired(jwtToken)) {
        var r = { error: 'The JWT is no longer valid', jwtToken: '' };
        res.status(200).json(r);
        return;
      }
    }

    catch (e) {
      console.log(e.message);
    }


    try {
      const db = client.db("myDB");


      if (isRecurr != true) {

        const search = { '_id': ObjectID(_id) };
        const updateEvent = {
          $set: {
            Title: Title, Description: Description,
            Location: Location, startDateUTC: startDateUTC, endDateUTC: endDateUTC, Duration: duration,
            isRecurr: isRecurr, recurrPattern: recPattern
          }
        };

        const result = db.collection('Events').updateOne(search, updateEvent);


      }

      // this is an unpdate for a re-occuring event
      else {


        const search = { '_id': ObjectID(_id) };
        const updateEvent = {
          $set: {
            startDateUTC: startDateUTC, endDateUTC: endDateUTC, Duration: duration,
            isRecurr: isRecurr, recurrPattern: recPattern
          }
        };
        let error = '';

        const result = db.collection('Events').updateOne(search, updateEvent);

      }

    }

    catch (e) {
      error = e.message;
      console.log(e.message);
    }




    var refreshedToken = null;
    try {
      refreshedToken = token.refresh(jwtToken);
    }

    catch (e) {
      console.log(e.message);
    }

    var ret = { error: error, jwtToken: refreshedToken };
    res.status(200).json(ret);
  });



  app.post('/api/deleteEvents', async (req, res, next) => {

    var token = require('./createJWT.js');
    var ObjectID = require('mongodb').ObjectId;


    /* the delete api when you do the search on the event _id you have to check the boolean if its recurring, 
    if not then you just delete. if it is then frontend will also be sending you a date that the user wanted 
    to be deleted. You have to use this date and with the api that Nassim wrote, put it into the date exception*/

    const { _id, isRecurr, userId, exceptionDate, jwtToken } = req.body;

    try {
      if (token.isExpired(jwtToken)) {
        var r = { error: 'The JWT is no longer valid', jwtToken: '' };
        res.status(200).json(r);
        return;
      }
    }

    catch (e) {
      console.log(e.message);
    }

    let error = '';

    try {

      const delEvent = { "_id": ObjectID(_id) };
      const db = client.db("myDB");

      console.log(isRecurr);

      if (isRecurr === false) {

        const result = db.collection('Events').deleteOne(delEvent);

      }
      else {
        const newDate = { exceptionDate: exceptionDate, userId: userId };
        const result = db.collection('eventExceptions').insertOne(newDate);
      }
    }
    catch (e) {
      error = e.toString();
    }

    var refreshedToken = null;
    try {
      refreshedToken = token.refresh(jwtToken);
    }

    catch (e) {
      console.log(e.message);
    }

    var ret = { error: error, jwtToken: refreshedToken };
    res.status(200).json(ret);
  });




  //++++++++++++++++++++Event Exceptions APIs++++++++++++++++++++
  app.post('/api/addDate', async (req, res, next) => {

    var token = require('./createJWT.js');

    const { userId, exceptionDate, jwtToken } = req.body;

    try {
      if (token.isExpired(jwtToken)) {
        var r = { error: 'The JWT is no longer valid', jwtToken: '' };
        res.status(200).json(r);
        return;
      }
    }

    catch (e) {
      console.log(e.message);
    }



    const newDate = { exceptionDate: exceptionDate, userId: userId };

    let error = '';

    try {
      const db = client.db("myDB");
      const result = db.collection('eventExceptions').insertOne(newDate);
    }

    catch (e) {
      error = e.toString();
    }

    var refreshedToken = null;
    try {
      refreshedToken = token.refresh(jwtToken);
    }

    catch (e) {
      console.log(e.message);
    }

    var ret = { error: error, jwtToken: refreshedToken };
    res.status(200).json(ret);
  });
}
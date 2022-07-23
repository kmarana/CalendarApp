var express=require('express');
require('mongodb');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
var ObjectID = require('mongodb').ObjectId;
const crypto = require('crypto');
const { ppid } = require('process');
var router = express.Router();

exports.setApp = function (app, client)
{
  
  //++++++++++++++++++++User APIs++++++++++++++++++++
  app.post('/api/login', async (req, res, next) => 
  {
    // incoming: login, password
    // outgoing: id, firstName, lastName, error
    
    const { login, password } = req.body;

    const db = client.db("myDB");
    const results = await 
    db.collection('Users').find({Login:login,Password:password}).toArray();

    var id = "";
    var fn = '';
    var ln = '';
    var error = '';

    var ret;
    
    if( results.length > 0 )
    {
      id = results[0]._id;
      fn = results[0].FirstName;
      ln = results[0].LastName;
      
      //myapp-calendar.herokuapp.com
      if(results[0].isVerified == false)
      {
        const msg = {
          to: results[0].email,
          from: "CalPal@4331cop.com",
          subject: "verify your email",
          text: `Hello, thank you for registering to <CALENDAR APP> 
              Please copy and paste the address below to verify your account
              http://localhost:3000/emailVerif?token=${results[0].emailToken}`,
          html: `<h1> Hello, <h1>
                <p> Thank you for registering on our site</p>
                <p> please click the link below to verify your account.</p>
                <a href=http://localhost:3000/emailVerif?token=${results[0].emailToken}>Verify account</a>`,
        }
        
        try{
          await sgMail.send(msg)
          error = "Please verify your email, a new verification link has been sent to your email"
          ret = { error: error };
          }
          catch(e) {
            error = e.toString();
            ret = {error: error};
          }
          return res.status(200).json(ret);
      }

      try
      {
        const token = require("./createJWT.js");
        ret = token.createToken( fn, ln, id );
      }
      catch(e)
      {
        ret = {error:e.message};
      }
    }

    else
    {
      ret = {error:"Login/Password incorrect"};
    }

    res.status(200).json(ret);
  });

  app.post('/api/register', async (req, res, next) => {
    // incoming: fn, ln, login, password, email
    // outgoing: error

    const { fn, ln, login, password, email} = req.body;


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
    const db = client.db("myDB");
    try {
      
      const user = db.collection('Users').find({"email": email});
      {
        if(user)
        {
          error = "A user has already been registered with that email";
          error = { error: error }
          return res.status(200).json(error);
        }
      }
      
      const result = db.collection('Users').insertOne(newUser);
    }

    catch (e) {
      error = e.toString();
    }

    const msg = {
      to: email,
      from: "CalPal@4331cop.com",
      subject: "verify your email",
      text: `Hello, thank you for registering to <CALENDAR APP> 
          Please copy and paste the address below to verify your account
          http://myapp-calendar.herokuapp.com/emailVerif?token=${newUser.emailToken}`,
      html: `<h1> Hello, <h1>
            <p> THank you for registering on our site</p>
            <p> please click the link below to verify your account.</p>
            <a href=http://myapp-calendar.herokuapp.com/emailVerif?token=${newUser.emailToken}>Verify account</a>`,
    }
    
    try{
      await sgMail.send(msg)
      ret = {emailToken: newUser.emailToken, error: error };
      }
      catch(e) {
        error = e.toString();
        ret = {error: error};
      }

    res.status(200).json(ret);
  });

  app.post('/api/emailVerif', async (req, res, next) => 
  {
    const { emailToken } = req.body;
    const db = client.db("myDB");
    let user;
   // let error = '';
    let retMsg = '';
    var ret;

      try{
        user = await db.collection('Users').findOne({"emailToken" : emailToken});
        if(user) {
          const search = {'emailToken': user.emailToken};
          const updateUser = { $set: {emailToken: null, isVerified: true}};
          await db.collection('Users').updateOne(search, updateUser);
          retMsg  = 'Your Email has been verified successfully';
          ret = { retMsg: retMsg };
          return res.status(200).json(ret);
        }

        else{
          retMsg = 'Verification link is invalid';
          ret = { retMsg: retMsg };
          return res.status(200).json(ret);
        }
      }
      catch (e) {
        retMsg = e.toString();
        ret = { retMsg: retMsg};
        return res.status(200).json(ret);
      }

      
  });

  app.post('/api/forgotPassword', async (req, res, next) => {

    const { search } = req.body;

    let error = '';
    const passToken = crypto.randomBytes(64).toString('hex');
    const db = client.db("myDB");
    var ret;
    let results;

    try {

      results = await db.collection('Users').findOne({ "email": search });
      if(!results){
        error = 'Registered user does not exist with that email';
        return res.redirect('/');
      }

      //email = {"email": search};
      const updateUser = { $set: { "passToken": passToken}};
      user = db.collection('Users').updateOne({"email": search}, updateUser);
    }
    catch (e) {
      error = e.toString();
      ret = { error: error };
    }

    const msg = {
      to: search,
      from: "CalPal@4331cop.com",
      subject: "Password Reset",
      text: `Forgot Password
          We have recieved a request to reset the password for your account.
          To reset password click on the link below.
          http://localhost:3000/passReset?token=${passToken}`,
      html: `<h1> Hello, <h1>
            <p>  We have recieved a request to reset the password for your account</p>
            <p> please click the link below to reset your password</p>
            <a href=http://localhost:3000/passReset?token=${passToken}>Reset Password</a>`,
    }

    console.log(error);

    try {
      await sgMail.send(msg);
      ret = { passToken: passToken, _id: results._id, error: error };
    }
    catch (e) {
      error = e.toString();
      ret = { error: error };
    }


    res.status(200).json(ret);
  });

  app.post('/api/resetPassword', async (req, res, next) => {

    var ObjectID = require('mongodb').ObjectId;
    const { password, passToken } = req.body;
    const db = client.db("myDB");

    let error = '';

    try {
      user = await db.collection('Users').findOne({"passToken" : passToken});
      if(!user) {
        error = 'Password reset link is invalid, please request a new email';
        return res.redirect('/');
      }

      const search = { "passToken": passToken };
      const updatePass = { $set: { Password: password, passToken: null } };

      const result = db.collection('Users').updateOne(search, updatePass);
    }
    catch (e) {
      error = e.toString();
    }

    var ret = { error: error };
    res.status(200).json(ret);

  });


  //++++++++++++++++++++Calendar APIs++++++++++++++++++++
  app.post('/api/addCalendar', async (req, res, next) =>
  {
    // incoming: userId, calName
    // outgoing: error

    var token = require('./createJWT.js');
    const { userId, calName, jwtToken } = req.body;

    try
    {
        if( token.isExpired(jwtToken))
        {
            var r = {error:'The JWT is no longer valid', jwtToken: ''};
            res.status(200).json(r);
            return;
        }
    }
    
    catch(e)
    {
      console.log(e.message);
    }

    //var uID = { "_id": ObjectID(userId) }
    const newCalendar = {calName:calName,UserId:userId};
    let error = '';

    try
    {
        const db = client.db("myDB");
        const result = db.collection('Calendars').insertOne(newCalendar);
    }

    catch(e)
    {
        error = e.toString();
    }

    var refreshedToken = null;
    try
    {
        refreshedToken = token.refresh(jwtToken);
    }

    catch(e)
    {
        console.log(e.message);
    }

    var ret = { error:error, jwtToken:refreshedToken };
    res.status(200).json(ret);
  });

  app.post('/api/searchCalendar', async (req, res, next) => 
  {
    // incoming: userId, search
    // outgoing: results[], error
    var token = require('./createJWT.js');
    const { userId, search, jwtToken } = req.body;

    try
    {
        if( token.isExpired(jwtToken))
        {
            var r = {error:'The JWT is no longer valid', jwtToken: ''};
            res.status(200).json(r);
            return;
        }
    }

    catch(e)
    {
      console.log(e.message);
    }

    let error = '';
    let _search = search.trim();
    
    const db = client.db("myDB");
    var uID = { "_id": ObjectID(userId) }
    const results = await db.collection('Calendars').find({"calName":{$regex:_search+'.*', $options:'r'}, "UserId":userId}).toArray();
    
    let _ret = [];

    for( var i=0; i<results.length; i++ )
    {
        _ret.push(_retObj = {
          calName: results[i].calName,
          calId: results[i]._id
        });
    }
    
    var refreshedToken = null;
    try
    {
      refreshedToken = token.refresh(jwtToken);
    }
    catch(e)
    {
      console.log(e.message);
    }
  
    var ret = { results:_ret, error:error, jwtToken:refreshedToken};
    res.status(200).json(ret);
  });


  app.post('/api/editCalendar', async (req, res, next) => 
  {

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

    var ret = { error: error , jwtToken: refreshedToken };
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
    var objectId;

    const { userId, calendarID, title, description, startDateUTC, endDateUTC,
      isRecurr, freq, jwtToken } = req.body;

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

    const newEvent = {
      userId: userId, calendarID: calendarID, Title: title, Description: description,
      startDateUTC: startDateUTC, endDateUTC: endDateUTC, Duration: duration,
      isRecurr: isRecurr, freq: freq 
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

    var ret = { jwtToken: refreshedToken, error: error, eventId: newEvent._id };
    res.status(200).json(ret);
  });


  app.post('/api/fetchEvents', async (req, res, next) => {

    var token = require('./createJWT.js');
    const { userId, calId, jwtToken } = req.body;

    try
    {
        if( token.isExpired(jwtToken))
        {
            var r = {error:'The JWT is no longer valid', jwtToken: ''};
            res.status(200).json(r);
            return;
        }
    }

    catch(e)
    {
      console.log(e.message);
    }

    let error = '';
    //let _search = search.trim();
    
    const db = client.db("myDB");
    //var uID = { "_id": ObjectID(userId) }
    const results = await db.collection('Events').find({ "userId": userId, "calendarID": calId }).toArray();
    
    let _ret = [];
    for( var i=0; i<results.length; i++ )
    {
        _ret.push( results[i].Title );
    }
    
    var refreshedToken = null;
    try
    {
      refreshedToken = token.refresh(jwtToken);
    }
    catch(e)
    {
      console.log(e.message);
    }
  
    var ret = { results:_ret, error:error, jwtToken:refreshedToken };
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

    const { eventId, isRecurr, /*exceptionDate,*/ jwtToken } = req.body;

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

      const delEvent = { "_id": ObjectID(eventId) };
      const db = client.db("myDB");

      if (isRecurr == "false") {

        const result = db.collection('Events').deleteOne(delEvent);

      }
      // if event is re-occuring, delete from events and add to event exception table
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

 app.post('/api/emailEvents', async (req, res, next) => {

      var token = require('./createJWT.js');
      //var ObjectID = require('mongodb').ObjectId;
  
      const { to, _id, jwtToken } = req.body;
  
      let error = '';
      const db = client.db("myDB");
      var ret;
      let title = '';
      let description = '';
      //let location = '';
      let startDateUTC = '';
      let endDateUTC = '';
      let duration = '';
  
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
  
        const results = await db.collection('Events').find({ '_id': { $eq: ObjectID(_id) } }).toArray();
  
        if (results.length > 0) {
          title = results[0].Title;
          description = results[0].Description;
          //location = results[0].Location;
          startDateUTC = results[0].startDateUTC;
          endDateUTC = results[0].endDateUTC;
          duration = results[0].Duration;
        }
      }
      catch (e) {
        error = e.toString();
        ret = { error: error };
      }
  
      const msg = {
        to: to,
        from: "CalPal@4331cop.com",
        subject: "Great News! Your Invited!",
        text: `
            You Have Been Invited to an Event! Don't Miss Out on the Time of Your Life!
            Title: ${title}
            Description: ${description}
            Location: ${location}
            Start Date: ${startDateUTC}
            End Date: ${endDateUTC}
            Duration: ${duration}`,
        html: `<h1> You Are Invited, <h1>
              <p>  You Have Been Invited to an Event! Don't Miss Out on the Time of Your Life!</p>
              <p> Title: ${title}</p>
              <p> Description: ${description}</p>
              <p> Location: ${location}</p>
              <p> Start Date: ${startDateUTC}</p>
              <p> End Date: ${endDateUTC}</p>
              <p> Duration: ${duration}</p>`,
      }
  
      try {
        await sgMail.send(msg);
      }
      catch (e) {
        error = e.toString();
        ret = { error: error };
      }
  
      var refreshedToken = null;
      try {
        refreshedToken = token.refresh(jwtToken);
      }
  
      catch (e) {
        console.log(e.message);
      }
  
      ret = { error: error, jwtToken: refreshedToken };
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

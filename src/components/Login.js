import React, { useState } from 'react';
import '../App.css';
import './Login.css';
import { Button } from './Button';
import 'react-router-dom';

function Login()
{
  let bp = require('./Path.js');

  var loginName;
  var loginPassword;

  const [message,setMessage] = useState('');

  const doLogin = async event => 
  {
      event.preventDefault();
      let obj = {login:loginName.value,password:loginPassword.value};
      let js = JSON.stringify(obj);

      var storage = require('../tokenStorage.js');

      try
      {    
          const response = await fetch(bp.buildPath('api/login'),
              {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
          var res = JSON.parse(await response.text());    

          if (res.error) 
          {
              setMessage(res.error);//'User/Password combination incorrect';
          }

          else 
          {
            storage.storeToken(res);
            let userId = res.id;
            let fn = res.firstName;
            let ln = res.lastName;
            let user = {firstName:fn,lastName:ln,id:userId}
            localStorage.setItem('user_data', JSON.stringify(user));
            setMessage('');
            window.location.href = '/cal';            
          }       
      }

      catch(e)
      {
        alert(e.toString());
        return;
      }   
  };
    
  return (
    <div className='login-container
      justify-content-center align-items-center'>
      <div className='loginSmall-container'>
      <h1>Login to Your Account</h1>
      <p>Please Enter Your Username and Password</p>
      <form onSubmit={doLogin}>
       <br />
      <input type="text" id="loginName" placeholder="Username" 
        ref={(c) => loginName = c} /> <br /> <br/>
      <input type="password" id="loginPassword" placeholder="Password" 
        ref={(c) => loginPassword = c} /> <br />
        <div className='login-btns'>
        <Button
          className='btns'
          buttonStyle='btn--outline'
          buttonSize='btn--large'
          onClick={doLogin}
        >
          Log In <i className='fa-solid fa-calendar-days' />
        </Button>
      </div>
      </form>
      <br/>
      <p>New User? Sign Up Here</p>
    </div>
    </div>
  );
};

export default Login;
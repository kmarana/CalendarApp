import React, { useState } from 'react';

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
            window.location.href = '/cards';            
          }       
      }

      catch(e)
      {
        alert(e.toString());
        return;
      }   
  };
    
    return(
      <div id="loginDiv">
        <form onSubmit={doLogin}>
        <span id="inner-title">PLEASE LOG IN</span><br />
        <input type="text" id="loginName" placeholder="Username" 
          ref={(c) => loginName = c} /> <br />
        <input type="password" id="loginPassword" placeholder="Password" 
          ref={(c) => loginPassword = c} /> <br />
        <input type="submit" id="loginButton" class="buttons" value = "Do It"
          onClick={doLogin} />
        </form>
        <span id="loginResult">{message}</span>
     </div>
    );
};

export default Login;

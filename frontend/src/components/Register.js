import React, { useState } from 'react';
import '../App.css';
import './Register.css';
import { Button } from './Button';
import { Link } from 'react-router-dom';

function Register()
{
  let bp = require('./Path.js');

  var fn = '';
  var ln = '';
  var login = '';
  var password = '';
  var email = '';

  const [message,setMessage] = useState('');
  
  const doRegister = async event => 
    {
      event.preventDefault();

      let obj = {fn:fn.value,ln:ln.value,login:login.value,password:password.value,email:email.value};
      let js = JSON.stringify(obj);

      try
      {
        const response = await fetch(bp.buildPath('api/register'),
        {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
        let txt = await response.text();
        let res = JSON.parse(txt);
        if( res.error.length > 0 )
        {
            setMessage( "API Error:" + res.error );
        }
        else
        {
            setMessage('User has been added, Please check your email to verify your account');
        }
      }
      catch(e)
      {
        setMessage(e.toString());
      }

      //let email_obj = email.value;
      //js = JSON.stringify(email_obj);
      /*try
      {
        const response = await fetch(bp.buildPath('api/emailVerif-send'),
        {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
        let txt = await response.text();
        let res = JSON.parse(txt);
        if( res.error.length > 0 )
        {
            setMessage( "API Error:" + res.error );
        }
        else
        {
            setMessage('An email has been sent for account authorization');
        }
      }
      catch(e)
      {
        setMessage(e.toString());
      }*/

  };

    return (
      <div className='addUser-container'>
        <div className='addUserSmall-container'>
        <h1>Sign Up for and Account</h1>
        <p>Please Enter a Username, Password, and Email</p>
        <form onSubmit={doRegister}>
        <br />
        <input type="text" id="fn" placeholder="First Name" 
        ref={(c) => fn = c} /> 
        <br />
        <input type="text" id="ln" placeholder="Last Name" 
        ref={(c) => ln = c} /> 
         <br />
        <input type="text" id="login" placeholder="Username" 
        ref={(c) => login = c} /> 
          <br />
        <input type="password" id="password" placeholder="Password" 
          ref={(c) => password = c} /> 
          <br />
          <input type="email" id="email" placeholder="Email" 
           ref={(c) => email = c} />
          <div className='login-btns'>
        <Link to='/register'>
          <Button
            className='btns'
            buttonStyle='btn--outline'
            buttonSize='btn--large'
            onClick={doRegister}
            
          >
            Sign Up <i className='fa-solid fa-calendar-days' />
          </Button>
          <span id="cardAddResult">{message}</span>
        </Link>
        </div>
        </form>
        <br/>
      </div>
      </div>
    );
};

export default Register;
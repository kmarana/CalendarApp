import React, { useState } from 'react';
import '../App.css';
import './Login.css';
import 'react-router-dom';
import { Button } from './Button';
import { Link } from 'react-router-dom';

function EmailVerif()
{
    let bp = require('./Path.js');

    const [message,setMessage] = useState('');
    const urlParams = new URLSearchParams(window.location.search);
    const emailToken = urlParams.get('token');

    const doEmailVerif = async event =>
    {
        let obj = {emailToken: emailToken};
        let js = JSON.stringify(obj)
        //let url = bp.buildPath('api/emailVerif');
        //url = `${url}/${emailToken}`;

        try{
            const response = await fetch(bp.buildPath('api/emailVerif'),
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
            var res = JSON.parse(await response.text());

            if(res.error)
            {
                setMessage(res.error); //"Validation unsuccessful"
            }
        } catch(e){
            alert(e.toString());;
            return;
        }
    };
       
    doEmailVerif();
    
    return(
        <div className='hero-container'>
        <h1>Email verified successfully</h1>
        <p>Because Every Day is Important</p>
        <div className='hero-btns'>
        <Link to="/login" >
          <Button
            className='btns'
            buttonStyle='btn--outline'
            buttonSize='btn--large'
          >
            LOGIN <i className='fa-solid fa-calendar-days' />
          </Button>
        </Link>
        </div>
      </div>
    )
};

export default EmailVerif;
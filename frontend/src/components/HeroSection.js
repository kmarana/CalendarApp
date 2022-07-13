import React from 'react';
import '../App.css';
import { Button } from './Button';
import './HeroSection.css';

function HeroSection() {

    const goToLogin = async event => 
    {
        window.location.href = '/LoginPage';
    }


  return (
    <div className='hero-container'>
      <h1>STAY CONNECTED</h1>
      <p>Because Every Day is Important</p>
      <div className='hero-btns'>
        <Button
          className='btns'
          buttonStyle='btn--outline'
          buttonSize='btn--large'
        >
          SIGN UP <i className='fa-solid fa-calendar-days' />
        </Button>
      </div>
    </div>
  );
}

export default HeroSection;
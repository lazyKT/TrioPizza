import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Button } from 'react-bootstrap';


import ReservationSteps from '../components/ReservationSteps';


export default function PreOrder () {

  const history = useHistory();

  const { userInfo } = useSelector(state => state.userCookie);
  const { info } = useSelector(state => state.reservation);


  const noPreOrderClick = (e) => {
    e.preventDefault();
    history.push('/reserve-confirm');
  };

  useEffect(() => {
    console.log('reservation', info);
    if (!userInfo)
      history.push('/');
  }, [userInfo, info]);


  return (
    <>
      <ReservationSteps
        step1={true}
        step2={true}
      />
      <h4>PreOrder Screen</h4>
      <p>You can pre-order the pizza you wanna have on the reserved date and reduce the waiting time :)</p>
      <br/>
      <br/>
      <Button
        className='mr-1'
        variant='primary'
      >
        Yes
      </Button>
      <Button
        className='mx-1'
        variant='secondary'
        onClick={noPreOrderClick}
      >
        No
      </Button>
    </>
  );
}

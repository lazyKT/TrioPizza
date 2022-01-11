import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';


import Loader from '../components/Loader';
import Message from '../components/Message';
import { getRestaurantInfo } from '../actions/restaurantActions';


export default function Dashboard () {

  const dispatch = useDispatch();

  const { userInfo } = useSelector(state => state.userCookie);
  const { loading, error, empty, restaurantInfo } = useSelector(state => state.restaurant);


  useEffect(() => {
    if (userInfo) {
      dispatch(getRestaurantInfo(userInfo.id, userInfo.token));
    }
  }, [userInfo]);


  return (
    <>
      { error && <Message variant='danger'>{error}</Message> }
      { loading && <Loader /> }
      { restaurantInfo && (
        <h5>{restaurantInfo.name}</h5>
      )}
    </>
  )
}

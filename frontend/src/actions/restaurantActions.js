import axios from 'axios';
import {
  RESTAURANT_INFO_REQUEST,
  RESTAURANT_INFO_ERROR,
  RESTAURANT_NA,
  RESTAURANT_INFO,
  RESTAURANT_EDIT_REQUEST,
  RESTAURANT_EDIT_ERROR,
  RESTAURANT_EDIT,
  RESTAURANT_CREATE,
  RESTAURANT_CREATE_ERROR,
  RESTAURANT_CREATE_REQUEST
} from '../constants/restaurantConstants';



export const createRestaurant = (token, body) => async (dispatch) => {
  try {
    dispatch({ type: RESTAURANT_CREATE_REQUEST });

    const config = {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
      }
    };

    const { data } = await axios.post('http://167.71.221.189/api/restaurants/', body, config);

    dispatch({
      type: RESTAURANT_CREATE,
      payload: data
    });
  }
  catch (error) {
    dispatch({
        type: RESTAURANT_CREATE_ERROR,
        payload: error.response && error.response.data.details
            ? error.response.data.details
            : error.message,
    });
  }
}


export const getRestaurantInfo = (ownerId, token, signal) => async (dispatch) => {
  try {
    dispatch({ type: RESTAURANT_INFO_REQUEST });

    const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        signal
    };

    const { data } = await axios.get(`http://167.71.221.189/api/restaurants?owner=${ownerId}`, config);

    const { restaurants, count } = data;

    if (count === 0)
      dispatch({ type: RESTAURANT_NA });
    else if (count > 0)
      dispatch({
        type: RESTAURANT_INFO,
        payload: restaurants[0]
      });

  }
  catch (error) {
    dispatch({
        type: RESTAURANT_INFO_ERROR,
        payload: error.response && error.response.data.details
            ? error.response.data.details
            : error.message,
    });
  }
}


export const updateRestaurantInfo = (restaurantId, body, token) => async (dispatch) => {
  try {
    dispatch({ type: RESTAURANT_EDIT_REQUEST });

    const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${token}`
        }
    };

    const { data } = await axios.put(`http://167.71.221.189/api/restaurants/${restaurantId}/`, body, config);

    dispatch({
      type: RESTAURANT_EDIT,
      payload: data
    });

    dispatch({
      type: RESTAURANT_INFO,
      payload: data
    });
  }
  catch (error) {
    dispatch({
        type: RESTAURANT_EDIT_ERROR,
        payload: error.response && error.response.data.details
            ? error.response.data.details
            : error.message,
    });
  }
}


export const updateRestaurantLocation = (restaurantId, body, token) => async (dispatch) => {
  try {
    dispatch({ type: RESTAURANT_EDIT_REQUEST });

    const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${token}`
        }
    };

    const { data } = await axios.put(`http://167.71.221.189/api/restaurants/location/${restaurantId}/`, body, config);

    dispatch({
      type: RESTAURANT_EDIT,
      payload: data
    });

    dispatch({
      type: RESTAURANT_INFO,
      payload: data
    });
  }
  catch (error) {
    dispatch({
        type: RESTAURANT_EDIT_ERROR,
        payload: error.response && error.response.data.details
            ? error.response.data.details
            : error.message,
    });
  }
}

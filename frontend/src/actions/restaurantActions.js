import axios from 'axios';
import {
  RESTAURANT_INFO_REQUEST,
  RESTAURANT_INFO_ERROR,
  RESTAURANT_NA,
  RESTAURANT_INFO
} from '../constants/restaurantConstants';



export const getRestaurantInfo = (ownerId, token) => async (dispatch) => {
  try {
    dispatch({ type: RESTAURANT_INFO_REQUEST });

    const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${token}`
        }
    };

    const { data } = await axios.get(`/api/restaurants?owner=${ownerId}`, config);

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

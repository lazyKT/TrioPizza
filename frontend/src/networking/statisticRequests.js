import axios from 'axios';


// restaurants registration stats
export async function fetchRegisteredRestaurantsStats (token, signal) {
  try {
    const { data } = await axios.get('/api/statistic/restaurant-register/', {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
      },
      signal
    });

    return { error: false, data };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return { error: true, message: error.response.data.details }
    else
      return { error: true, message: error.message }
  }
}


// driver number of total orders and deliveries
export async function fetchDriversOrdersDeliveries (token, signal) {
  try {
    const { data } = await axios.get('/api/statistic/driver-order-deliveries/', {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
      },
      signal
    });

    return { error: false, data };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return { error: true, message: error.response.data.details }
    else
      return { error: true, message: error.message }
  }
}


// monthly/weekly/daily stats of restaurants orders and reservations
export async function fetchRestaurantsTimelineStats (restaurant_id, area, filter, token, signal) {
  try {
    const url = `/api/statistic/restaurant-reserve-orders/${restaurant_id}/?data=${area}&filter=${filter}`;

    const { data } = await axios.get(url, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
      },
      signal
    });

    return { error: false, data };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return { error: true, message: error.response.data.details }
    else
      return { error: true, message: error.message }
  }
}


// get sales data from products
export async function fetchRestaurantProductsStats (restaurant_id, token, signal) {
  try {
    const { data } = await axios.get(`/api/statistic/restaurant-products/${restaurant_id}/`, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
      },
      signal
    });

    return { error : false, data };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return { error: true, message: error.response.data.details }
    else
      return { error: true, message: error.message }
  }
}


export async function fetchRestaurantOrderStats (restaurant_id, token, signal) {
  try {
    const { data } = await axios.get(`/api/statistic/restaurant-orders/${restaurant_id}/`, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
      },
      signal
    });

    return { error: false, data };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return { error: true, message: error.response.data.details }
    else
      return { error: true, message: error.message }
  }
}

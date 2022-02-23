import axios from 'axios';



export async function getOrderDetails (orderId, token, signal) {
  try {
    const { data } = await axios.get(`http://167.71.221.189/api/orders/${orderId}`, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization: `Bearer ${token}`
      },
      signal
    });

    return {error: false, data };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return {error: true, message: error.response.data.details};
    else
      return {error: true, message: error.message};
  }
}


export async function asignDriverToOrder (driver, order, token) {
  try {

    const body = {
      driver, order
    };

    const { data } = await axios.put('http://167.71.221.189/api/orders/assign-driver/', body, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
      }
    });

    return { error: false, data }
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return { error: true, message: error.response.data.details };
    else
      return { error: true, message: error.message };
  }
}


export async function cancelOrder (orderId, token) {
  try {
    const { data } = await axios.put(`http://167.71.221.189/api/orders/${orderId}/cancel/`, null, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    return {error: false, data };
  }
  catch (error) {
    console.log(error);
    if (error.response && error.response.data.details)
      return {error: true, message: error.response.data.details};
    else
      return {error: true, message: error.message};
  }
}


export async function completeOrder (orderId, token) {
  try {
    const { data } = await axios.put(`http://167.71.221.189/api/orders/${orderId}/deliver/`, null, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    return {error: false, data };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return {error: true, message: error.response.data.details};
    else
      return {error: true, message: error.message};
  }
}


export async function getOrdersByDriver (driverId, token, signal, page=1) {
  try {
    const { data } = await axios.get(`http://167.71.221.189/api/orders/deliveries/${driverId}?page=${page}`, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
      },
      signal
    });

    return {error: false, data};
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return {error: true, message: error.response.data.details};
    else
      return {error: true, message: error.message};
  }
}


export async function getDriverOrderStats (driverId, token, signal) {
  try {
    const { data } = await axios.get(`http://167.71.221.189/api/orders/driver-stats/${driverId}/`, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization: `Bearer ${token}`
      },
      signal
    });

    return { error: false, data }
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return {error: true, message: error.response.data.details};
    else
      return {error: true, message: error.message};
  }
}


export async function getOrdersWithinTimeFrames (restaurantId, date1, date2, token) {
  try {
    const { data } = await axios.get(`http://167.71.221.189/api/orders/restaurants/${restaurantId}/?date1=${date1}&date2=${date2}`, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
      }
    });

    return { error: false, data }
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return {error: true, message: error.response.data.details};
    else
      return {error: true, message: error.message};
  }
}

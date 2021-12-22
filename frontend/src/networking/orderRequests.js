import axios from 'axios';



export async function getOrderDetails (orderId, token, signal) {
  try {
    const { data } = await axios.get(`/api/orders/${orderId}`, {
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


export async function cancelOrder (orderId, token) {
  try {
    const { data } = await axios.put(`/api/orders/${orderId}/cancel/`, null, {
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
    const { data } = await axios.put(`/api/orders/${orderId}/deliver/`, null, {
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


export async function getOrdersByDriver (driverId, token, signal) {
  try {
    const { data } = await axios.get(`/api/orders/deliveries/${driverId}`, {
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

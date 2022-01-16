import axios from 'axios';



export async function getRestaurantProducts (restaurantId, signal) {
  try {
    const { data } = await axios.get(`/api/products/restaurants/${restaurantId}`, {
      headers: {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
      },
      signal
    });

    return { error: false, data };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return {error: true, message: error.response.data.details};
    else
      return {error: true, message: error.message};
  }
}


export async function getFeatureProducts (restaurantId, token, signal) {
  try {
    const { data } = await axios.get(`/api/products/featuring?restaurant=${restaurantId}`, {
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
      return {error: true, message: error.response.data.details};
    else
      return {error: true, message: error.message};
  }
}


export async function addToFeatureProducts (body, token) {
  try {
    const { data } = await axios.post(`/api/products/featuring/`, body, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
      }
    });

    return { error: false, data };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return {error: true, message: error.response.data.details};
    else
      return {error: true, message: error.message};
  }
}


export async function removeFromFeatureProducts (id, token) {
  try {
    const { data } = await axios.delete(`/api/products/featuring/${id}/`, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
      }
    });

    return { error: false };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return {error: true, message: error.response.data.details};
    else
      return {error: true, message: error.message};
  }
}

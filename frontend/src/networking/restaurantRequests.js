import axios from 'axios';


export async function getAllRestaurants (signal) {
  try {
    const { data } = await axios.get(`/api/restaurants`, {
      headers: {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
      },
      signal: signal
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



export async function getRestaurantById (id, signal) {
  try {
    const { data } = await axios.get(`/api/restaurants/${id}/`, {
      headers: {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
      },
      signal
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



export async function uploadNewLogo (restaurantId, body, token) {
  try {
    console.log('uploading new logo request ...');
    const { data } = await axios.post(`/api/restaurants/upload/${restaurantId}/`, body, {
      headers: {
        'Content-Type' : 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });

    return { error: false, data };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return { error: true, message: error.response.data.details };
    else
      return { error: true, message: error.message };
  }
}

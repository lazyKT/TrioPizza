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

    return { error: false, data }
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return {error: true, message: error.response.data.details};
    else
      return {error: true, message: error.message};
  }
}

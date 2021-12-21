import axios from 'axios';



export async function getAllDriverStatus (token, signal) {
  try {
      const { data } = await axios.get('/api/users/drivers/status', {
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
      return { error: true, message: error.response.data.details };
    else
      return { error: true, message: error.message };
  }
}

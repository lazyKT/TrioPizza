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



export async function getDriverWorkingStatus (driverId, token, signal) {
  try {
    const { data } = await axios.get(`/api/users/drivers/status/${driverId}`, {
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


export async function updateWorkingStatus (driverId, status, token) {
  try {
    const body = {
      driver: parseInt(driverId),
      status
    }
    const { data } = await axios.put('/api/users/drivers/status/update', body, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
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

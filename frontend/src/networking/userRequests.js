import axios from 'axios';



export async function getUserById (userId, token, signal) {
  try {
    const { data } = await axios.get(`api/users/${userId}`, {
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
      return { error : true, message : error.response.data.details };
    else
      return { error : true, message : error.message };
  }
}

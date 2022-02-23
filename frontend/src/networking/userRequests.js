import axios from 'axios';



export async function searchUsersRequest (filter) {
  try {
    const { data } = await axios.get(`http://167.71.221.189/api/users/?search=${filter}`, {
      headers: {
        'Content-Type' : 'application/json'
      }
    });

    return { error: false, data }
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return { error : true, message : error.response.data.details };
    else
      return { error : true, message : error.message };
  }
}


export async function getUserById (userId, token, signal) {
  try {
    const { data } = await axios.get(`http://167.71.221.189/api/users/${userId}`, {
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


export async function requestPasswordResetLink (email) {
  try {
    const { data } = await axios.post('http://167.71.221.189/api/users/gen-password-reset-link/', { email }, {
      headers: {
        'Content-Type' : 'application/json',
      }
    });

    return { error: false, data : data.details };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return { error : true, message : error.response.data.details };
    else
      return { error : true, message : error.message };
  }
}


export async function resetPasswordRequest (body) {
  try {
    const { data } = await axios.post('http://167.71.221.189/api/users/reset-password/', body, {
      headers: {
        'Content-Type' : 'application/json'
      }
    });

    return { error: false, data : data.details };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return { error : true, message : error.response.data.details };
    else
      return { error : true, message : error.message };
  }
}

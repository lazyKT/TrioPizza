import axios from 'axios';



export async function getUserSavedAddresses (id, token, signal) {
  try {
    const { data } = await axios.get(`/api/users/${id}/addresses`, {
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
      return { error: true, message: error.response.data.details }
    else
      return { error: true, message: error.message }
  }
}


export async function saveNewAddress (address, id, token) {
  try {
    const body = {
      ...address,
      user: id
    }
    const { data } = await axios.post(`api/users/addresses/`, body, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
      }
    });

    return { error: false, data : data }
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return { error: true, message: error.response.data.details }
    else
      return { error: true, message: error.message }
  }
}

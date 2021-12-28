import axios from 'axios';


export async function createNewReservationRequest (reservation, token) {
  try {
    const { data } = await axios.post(`api/reservations/`, reservation, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
      }
    });

    return { error : false, data }
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return { error : true, message : error.response.data.details };
    else
      return { error : true, message : error.message };
  }
}



export async function getUsersReservations (userId, token, signal) {
  try {
    const { data } = await axios.get(`api/reservations/users/${userId}/`, {
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



export async function getReservationById (reservationId, token, signal) {
  try {
    const { data } = await axios.get(`api/reservations/${reservationId}`, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
      }
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

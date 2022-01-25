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



export async function getUsersReservations (userId, token, signal, page=1) {
  try {
    const { data } = await axios.get(`api/reservations/users/${userId}?page=${page}`, {
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


// get list of reservations by given date or datetime
export async function getReservationListByDateTime ({ restaurantId, date, datetime, token, signal }) {
  try {
    const config = {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
      },
      signal
    };

    if (date) {
      const { data } = await axios.get(`http://127.0.0.1:8000/api/reservations/?restaurant=${restaurantId}&date=${date}`, {
        config
      });
      return { error : false, data };
    }
    if (datetime) {
      const { data } = await axios.get(`http://127.0.0.1:8000/api/reservations/?restaurant=${restaurantId}&datetime=${datetime}`, {
        config
      });
      return { error : false, data };
    }
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return { error : true, message : error.response.data.details };
    else
      return { error : true, message : error.message };
  }
}


// get reservation by reservation id
export async function getReservationById (reservationId, token, signal) {
  try {
    const { data } = await axios.get(`api/reservations/${reservationId}`, {
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


export async function editReservationById (reservationId, body, token) {
  try {
    const { data } = await axios.put(`api/reservations/${reservationId}/`, body, {
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

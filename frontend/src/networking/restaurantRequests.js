import axios from 'axios';


export async function getAllRestaurants (signal, limit=8) {
  try {
    const { data } = await axios.get(`/api/restaurants?limit=${limit}`, {
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


export async function createNewPromotion (body, token) {
  try {
    const { data } = await axios.post(`/api/restaurants/promos/`, body, {
      headers: {
        'Content-Type' : 'application/json',
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


export async function fetchPromotionsByRestaurant (restaurantId, token, signal) {
  try {
    const { data } = await axios.get(`/api/restaurants/promos?restaurant=${restaurantId}`, {
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
      return { error: true, message: error.response.data.details };
    else
      return { error: true, message: error.message };
  }
}



export async function createRestaurantReview (body, token) {
  try {
    const { data } = await axios.post(`/api/restaurants/reviews/`, body, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization :  `Bearer ${token}`
      }
    });

    return { error : false, data };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return { error: true, message: error.response.data.details };
    else
      return { error: true, message: error.message };
  }
}


export async function fetchRestaurantReviews (restaurantId, signal, page=1) {
  try {
    const { data } = await axios.get(`/api/restaurants/reviews?restaurant=${restaurantId}&page=${page}`, {
      headers: {'Content-Type' : 'application/json'},
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


export async function fetchReservationTimeSlots (restaurantId, startDate, endDate, token, signal) {
  try {
    const { data } = await axios.get(`/api/reservations/restaurant/${restaurantId}?date1=${startDate}&date2=${endDate}`, {
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
      return { error: true, message: error.response.data.details };
    else
      return { error: true, message: error.message };
  }
}


export async function fetchReservationByDates (restaurantId, startDate, endDate, token, signal) {
  try {
    const { data } = await axios.get(`/api/reservations/restaurant/day/${restaurantId}?date1=${startDate}&date2=${endDate}`, {
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
      return { error: true, message: error.response.data.details };
    else
      return { error: true, message: error.message };
  }
}

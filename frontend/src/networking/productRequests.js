import axios from 'axios';


// get products from restaurant
export async function getRestaurantProducts (restaurantId, signal, page=1) {
  try {
    const { data } = await axios.get(`/api/products/restaurants/${restaurantId}?page=${page}`, {
      headers: {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
      },
      signal
    });

    return { error: false, data };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return {error: true, message: error.response.data.details};
    else
      return {error: true, message: error.message};
  }
}


// get feature product list
export async function getFeatureProducts (restaurantId, token, signal) {
  try {
    const { data } = await axios.get(`/api/products/featuring?restaurant=${restaurantId}`, {
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
      return {error: true, message: error.response.data.details};
    else
      return {error: true, message: error.message};
  }
}


// add product to feature product list
export async function addToFeatureProducts (body, token) {
  try {
    const { data } = await axios.post(`/api/products/featuring/`, body, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
      }
    });

    return { error: false, data };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return {error: true, message: error.response.data.details};
    else
      return {error: true, message: error.message};
  }
}


// remove product from feature product list
export async function removeFromFeatureProducts (id, token) {
  try {
    const { data } = await axios.delete(`/api/products/featuring/${id}/`, {
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Bearer ${token}`
      }
    });

    return { error: false };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return {error: true, message: error.response.data.details};
    else
      return {error: true, message: error.message};
  }
}


// upload product new image
export async function uploadNewProductImage (productId, body, token) {
  try {
    const { data } = await axios.post(`/api/products/upload/${productId}/`, body, {
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


// get product promotion details
export async function getProductPromotion (productId, signal) {
  try {
    const { data } = await axios.get(`/api/restaurants/promos?product=${productId}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      signal
    });

    return { error: false, data: data[0] };
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return { error: true, message: error.response.data.details };
    else
      return { error: true, message: error.message };
  }
}

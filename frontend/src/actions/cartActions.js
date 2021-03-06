import axios from 'axios'
import {
    CART_ADD_ITEM,
    CART_REMOVE_ITEM,
    CART_SAVE_SHIPPING_ADDRESS,
    CART_CHANGE_QTY,
    CART_SAVE_PAYMENT_METHOD,
} from '../constants/cartConstants'


function discountedPrice (price, amount, type) {

  if (type === 'cash-off') {
    return price - Number(amount);
  }
  else if (type === 'percent-off') {
    let percentage = Number(amount)/100;
    return (price - (price * percentage)).toFixed(2);
  }
}


export const addToCart = (id, qty) => async (dispatch, getState) => {
    const { data } = await axios.get(`http://167.71.221.189/api/products/${id}`);
    const { data: promoData } = await axios.get(`http://167.71.221.189/api/restaurants/promos?product=${id}`);

    const productPrice = promoData && promoData[0]?.status === 'active'
                          ? discountedPrice(parseFloat(data.price), promoData[0]?.amount, promoData[0]?.type)
                          : parseFloat(data.price);

    dispatch({
        type: CART_ADD_ITEM,
        payload: {
            product: data._id,
            name: data.name,
            image: data.image,
            price: parseFloat(productPrice),
            countInStock: data.countInStock,
            totalPrice: parseFloat(parseInt(qty) * productPrice),
            promo: promoData && promoData[0]?.status === 'active',
            qty
        }
    })
    // localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
}


export const changeQty = (id, qty) => async (dispatch, getState) => {
    const { data } = await axios.get(`http://167.71.221.189/api/products/${id}`);
    const { data: promoData } = await axios.get(`http://167.71.221.189/api/restaurants/promos?product=${id}`);

    const productPrice = promoData && promoData[0]?.status === 'active'
                          ? discountedPrice(parseFloat(data.price), promoData[0]?.amount)
                          : parseFloat(data.price);

    dispatch({
        type: CART_CHANGE_QTY,
        payload: {
            product: data._id,
            name: data.name,
            image: data.image,
            price: parseFloat(productPrice),
            countInStock: data.countInStock,
            totalPrice: parseFloat(parseInt(qty) * productPrice),
            promo: promoData && promoData[0]?.status === 'active',
            qty
        }
    })
    // localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
}


export const removeFromCart = (id) => (dispatch, getState) => {
    dispatch({
        type: CART_REMOVE_ITEM,
        payload: id,
    })

    // localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
}


export const saveShippingAddress = (data) => (dispatch) => {
    dispatch({
        type: CART_SAVE_SHIPPING_ADDRESS,
        payload: data,
    })

    // localStorage.setItem('shippingAddress', JSON.stringify(data));
}

export const savePaymentMethod = (data) => (dispatch) => {
    dispatch({
        type: CART_SAVE_PAYMENT_METHOD,
        payload: data,
    })

    // localStorage.setItem('paymentMethod', JSON.stringify(data));
}

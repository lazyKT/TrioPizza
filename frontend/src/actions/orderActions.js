import axios from 'axios'
import {
    ORDER_CREATE_REQUEST,
    ORDER_CREATE_SUCCESS,
    ORDER_CREATE_FAIL,

    ORDER_CANCEL_REQUEST,
    ORDER_CANCEL_FAIL,
    ORDER_CANCEL_SUCCESS,
    ORDER_CANCEL_RESET,

    ORDER_DETAILS_REQUEST,
    ORDER_DETAILS_SUCCESS,
    ORDER_DETAILS_FAIL,

    ORDER_PAY_REQUEST,
    ORDER_PAY_SUCCESS,
    ORDER_PAY_FAIL,
    ORDER_PAY_RESET,

    ORDER_LIST_MY_REQUEST,
    ORDER_LIST_MY_SUCCESS,
    ORDER_LIST_MY_FAIL,
    ORDER_LIST_MY_RESET,

    ORDER_LIST_REQUEST,
    ORDER_LIST_SUCCESS,
    ORDER_LIST_FAIL,

    ORDER_DELIVER_REQUEST,
    ORDER_DELIVER_SUCCESS,
    ORDER_DELIVER_FAIL,
    ORDER_DELIVER_RESET,
} from '../constants/orderConstants'

import { CART_CLEAR_ITEMS } from '../constants/cartConstants'


export const createOrder = (order) => async (dispatch, getState) => {
    try {
        dispatch({
            type: ORDER_CREATE_REQUEST
        })

        const {
            userCookie: { userInfo },
        } = getState()

        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        };

        const body = {
          ...order,
          user: userInfo.id
        };

        const { data } = await axios.post(
            `http://167.71.221.189/api/orders/`,
            body,
            config
        )

        dispatch({
            type: ORDER_CREATE_SUCCESS,
            payload: data
        })

        dispatch({
            type: CART_CLEAR_ITEMS,
            payload: data
        });

    } catch (error) {
        dispatch({
            type: ORDER_CREATE_FAIL,
            payload: error.response && error.response.data.details
                ? error.response.data.details
                : error.message,
        })
    }
}


export const getOrderDetails = (id) => async (dispatch, getState) => {
    try {
        dispatch({
            type: ORDER_DETAILS_REQUEST
        })

        const {
            userCookie: { userInfo },
        } = getState()

        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        const { data } = await axios.get(
            `http://167.71.221.189/api/orders/${id}/`,
            config
        )

        dispatch({
            type: ORDER_DETAILS_SUCCESS,
            payload: data
        })


    } catch (error) {
        dispatch({
            type: ORDER_DETAILS_FAIL,
            payload: error.response && error.response.data.details
                ? error.response.data.details
                : error.message,
        });
    }
}



export const payOrder = (id, paymentResult) => async (dispatch, getState) => {
    try {
        dispatch({
            type: ORDER_PAY_REQUEST
        })

        const {
            userLogin: { userInfo },
        } = getState()

        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        const { data } = await axios.put(
            `http://167.71.221.189/api/orders/${id}/pay/`,
            paymentResult,
            config
        )

        dispatch({
            type: ORDER_PAY_SUCCESS,
            payload: data
        })


    } catch (error) {
        dispatch({
            type: ORDER_PAY_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}


export const deliverOrder = orderId => async (dispatch, getState) => {
    try {
        dispatch({
            type: ORDER_DELIVER_REQUEST
        })

        const { userCookie: { userInfo } } = getState();

        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        };

        const { data } = await axios.put(
            `http://167.71.221.189/api/orders/${orderId}/deliver/`,
            {},
            config
        )

        dispatch({
            type: ORDER_DELIVER_SUCCESS,
            payload: data
        })


    } catch (error) {
        dispatch({
            type: ORDER_DELIVER_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}



export const listMyOrders = (page = 1) => async (dispatch, getState) => {
    try {
        dispatch({
            type: ORDER_LIST_MY_REQUEST
        });

        const { userCookie: { userInfo } } = getState();

        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        const { data } = await axios.get(
            `http://167.71.221.189/api/orders/myorders/${userInfo.id}?page=${page}`,
            config
        );

        dispatch({
            type: ORDER_LIST_MY_SUCCESS,
            payload: data
        });


    } catch (error) {
        dispatch({
            type: ORDER_LIST_MY_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}


export const listOrders = (restaurant, page=1) => async (dispatch, getState) => {
    try {
        dispatch({
            type: ORDER_LIST_REQUEST
        })

        const { userCookie: { userInfo } } = getState()

        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        const { data } = await axios.get(
            `http://167.71.221.189/api/orders?page=${page}&restaurant=${restaurant}`,
            config
        );

        dispatch({
            type: ORDER_LIST_SUCCESS,
            payload: data
        })


    } catch (error) {
        dispatch({
            type: ORDER_LIST_FAIL,
            payload: error.response && error.response.data.details
                ? error.response.data.details
                : error.message,
        })
    }
}



export const cancelOrder = orderId => async (dispatch, getState) => {
  try {
      dispatch({
        type: ORDER_CANCEL_REQUEST
      });

      const { userCookie: { userInfo } } = getState();

      const { data } = await axios.put(`http://167.71.221.189/api/orders/${orderId}/cancel/`, {
        headers: {
          'Content-Type' : 'Application/json',
          Authorization: `Bearer ${userInfo.token}`
        }
      });

      dispatch({
        type: ORDER_CANCEL_SUCCESS
      });
  }
  catch (error) {
    dispatch({
        type: ORDER_CANCEL_FAIL,
        payload: error.response && error.response.data.details
            ? error.response.data.details
            : error.message,
    });
  }
}

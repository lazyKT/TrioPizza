import axios from 'axios';
import {
  RESERVATION_MAKE_PREORDER,
  RESERVATION_ADD_PREORDER_ITEM,
  RESERVATION_INFO,
  RESERVATION_CLEAR_DATA
} from '../constants/reservationConstants';


export const includePreOrder = () => (dispatch, getState) => {
  dispatch({
    type: RESERVATION_MAKE_PREORDER
  });
};


export const addPreOrderItems = (id) => async (dispatch, getState) => {

  const { product } = await axios.get(`/api/products/${id}`);

  dispatch({
    type: RESERVATION_ADD_PREORDER_ITEM,
    payload: product
  });
};


export const saveReservationInfo = (info) => (dispatch) => {
  dispatch({
    type: RESERVATION_INFO,
    payload: info
  });
}


export const resetDataReservation = () => (dispatch, getState) => {
  dispatch({
    type: RESERVATION_CLEAR_DATA
  });
}

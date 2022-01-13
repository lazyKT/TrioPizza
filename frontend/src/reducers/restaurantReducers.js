import {
  RESTAURANT_INFO,
  RESTAURANT_INFO_REQUEST,
  RESTAURANT_INFO_ERROR,
  RESTAURANT_EDIT,
  RESTAURANT_LOGO,
  RESTAURANT_RESET,
  RESTAURANT_NA,
  RESTAURANT_EDIT_ERROR,
  RESTAURANT_EDIT_REQUEST
} from '../constants/restaurantConstants';



export function restaurantReducer (state={}, action) {

  switch (action.type) {

    case RESTAURANT_INFO_REQUEST:
      return { loading: true };

    case RESTAURANT_INFO:
      return { loading: false, restaurantInfo: action.payload };

    case RESTAURANT_NA:
      return { loading: false, empty: true };

    case RESTAURANT_INFO_ERROR:
      return { loading: false, error: action.payload };

    case RESTAURANT_EDIT_REQUEST:
      return { loading: true };

    case RESTAURANT_EDIT:
      return { loading: false, restaurantInfo: action.payload };

    case RESTAURANT_EDIT_ERROR:
      return { loading: false, error: action.payload };

    case RESTAURANT_RESET:
      return {};

    default:
      return state;
  }
}

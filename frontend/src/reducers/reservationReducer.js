import {
  RESERVATION_MAKE_PREORDER,
  RESERVATION_ADD_PREORDER_ITEM,
  RESERVATION_INFO,
  RESERVATION_CLEAR_DATA
} from '../constants/reservationConstants';



export function reservationReducer (
  state = {
    preOrder: false, preOrderItems: [], info: {}, new : false
  },
  action
) {

  switch(action.type) {
    case RESERVATION_MAKE_PREORDER:
      return {
        ...state,
        preOrder: true
      };

    case RESERVATION_ADD_PREORDER_ITEM:
        const item = action.payload;
        const existingItem = state.preOrderItems.find(i => i.id === item.id);

        if (existingItem) {
          return {
            ...state,
            preOrderItems: state.preOrderItems.map(i =>
              i.id === item.id ? i.qty+1 : i
            )
          };
        }
        else {
          return {
              ...state,
              cartItems: [...state.preOrderItems, item]
          }
        }

    case RESERVATION_INFO:
      return {
        ...state,
        info : action.payload
      }

    case RESERVATION_CLEAR_DATA:
      return {
        preOrder: false,
        preOrderItems: [],
        info: {}
      }

    default:
      return state
  }
}

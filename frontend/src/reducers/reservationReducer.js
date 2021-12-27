import {
  RESERVATION_MAKE_PREORDER,
  RESERVATION_ADD_PREORDER_ITEM,
  RESERVATION_INFO,
  RESERVATION_CLEAR_DATA
} from '../constants/reservationConstants';


export const reservationReducer = (
  state = {
    preOrder: false,
    preOrderItems: [],
    info: {}
  },
  action
) => {
  switch(action.Type) {
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
      const info = action.payload;
      return {
        ...state,
        info
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

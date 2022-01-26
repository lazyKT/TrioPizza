import {
  RESERVATION_MAKE_PREORDER,
  RESERVATION_ADD_PREORDER_ITEM,
  RESERVATION_REMOVE_PREORDER_ITEM,
  RESERVATION_INFO,
  RESERVATION_CLEAR_DATA,
  RESERVATION_RESTAURANT,
} from '../constants/reservationConstants';



export function reservationReducer (
  state = {
    preOrder: false, preOrderItems: [], info: {}, new : false, restaurantId : null, restaurantName: null
  },
  action
) {
  // console.log(action.type, action.payload);
  switch(action.type) {
    case RESERVATION_RESTAURANT:
      return {
        ...state,
        restaurantId: action.payload.id,
        restaurantName: action.payload.name
      }

    case RESERVATION_MAKE_PREORDER:
      return {
        ...state,
        preOrder: true
      };

    case RESERVATION_ADD_PREORDER_ITEM:
        const item = action.payload;
        const existingItem = state.preOrderItems.find(i => i._id === item._id);

        if (existingItem) {
          return {
            ...state,
            preOrderItems: state.preOrderItems.map(i => {
              if (i._id === item._id) {
                return {
                  ...i,
                  qty: parseInt(i.qty) + 1
                }
              }
              return i;
            })
          };
        }
        else {
          return {
            ...state,
            preOrderItems: [...state.preOrderItems, {...item, qty: 1}]
          }
        }

    case RESERVATION_REMOVE_PREORDER_ITEM:
      const removeItem = action.payload;
      return {
        ...state,
        preOrderItems: state.preOrderItems.filter(i => i._id !== removeItem._id)
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
        info: {},
        restaurantId: null,
        restaurantName: null,
        new: false
      }

    default:
      return state
  }
}

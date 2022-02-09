import {
  RESTAURANT_CART,
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_SAVE_SHIPPING_ADDRESS,
  CART_SAVE_PAYMENT_METHOD,
  CART_CLEAR_ITEMS,
  CART_CHANGE_QTY
} from '../constants/cartConstants'



export const cartReducer = (state = { cartItems: [], shippingAddress: {}, restaurant: null }, action) => {
  
    switch (action.type) {
      case RESTAURANT_CART:
        return {
          ...state,
          restaurant: action.payload
        };

      case CART_ADD_ITEM:
        const item = action.payload
        const existItem = state.cartItems.find(x => x.product === item.product);

        if (existItem) {
          return {
            ...state,
            cartItems: state.cartItems.map(x => {
              if (x.product === item.product) {
                return {
                  ...x,
                  qty: parseInt(x.qty) + 1,
                  totalPrice: Number(x.totalPrice) + item.totalPrice
                };
              }
              else
                return x;
            })
          };
        }
        else {
          return {
            ...state,
            cartItems: [...state.cartItems, item]
          };
        }

      case CART_CHANGE_QTY:
        const _item = action.payload;
        const _existItem = state.cartItems.find(x => x.product === _item.product);
        if (_existItem) {
          return {
            ...state,
            cartItems: state.cartItems.map(x => {
              if (x.product === _item.product) {
                return {
                  ...x,
                  qty: _item.qty,
                  totalPrice: Number(x.totalPrice)
                };
              }
              else
                return x;
            })
          };
        }
        else
          return state;

      case CART_REMOVE_ITEM:
        return {
          ...state,
          cartItems: state.cartItems.filter(x => x.product !== action.payload)
        };

      case CART_SAVE_SHIPPING_ADDRESS:
        return {
          ...state,
          shippingAddress: action.payload
        };

      case CART_SAVE_PAYMENT_METHOD:
        return {
          ...state,
          paymentMethod: action.payload
        };

      case CART_CLEAR_ITEMS:
        return {
          cartItems: [],
          shippingAddress: {},
          restaurant: null
        };

      default:
        return state;
    }
}

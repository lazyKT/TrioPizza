import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { HashRouter as Router, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './screens/HomeScreen';
import SupportScreen from './screens/SupportScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import ForgotPassword from './screens/ForgotPassword';
import ResetPassword from './screens/ResetPassword';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import ShippingScreen from './screens/ShippingScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import OrderListScreen from './screens/OrderListScreen';
import CreateReservation from './screens/CreateReservation';
import PreOrder from './screens/PreOrder';
import ReserveConfirm from './screens/ReserveConfirm';
import ReservationListScreen from './screens/ReservationListScreen';
import ReservationScreen from './screens/ReservationScreen';
import RestaurantScreen from './screens/RestaurantScreen';
import RestaurantReviewScreen from './screens/RestaurantReviewScreen';

import Admin from './admin/Admin';
import DriverDashboard from './driver/Dashboard';
import DriverStats from './screens/DriverStats';

import RestaurantOwner from './restaurant_owner/RestaurantOwner';



function App() {

  const [ showHeader, setShowHeader ] = useState(true);

  const hideHeader = () => setShowHeader(false);

  const displayHeader = () => setShowHeader(true);

  return (
    <Router>
      <Header/>
      <main className="py-3">
        <Container>
          <Route path='/' exact
            render={props =>
              <HomeScreen />
            }
          />
          <Route path='/login' component={LoginScreen} />
          <Route path='/forgot-password' component={ForgotPassword} />
          <Route path='/reset-password' component={ResetPassword} />
          <Route path='/register' component={RegisterScreen} />
          <Route path='/support' component={SupportScreen} />
          <Route path='/profile' component={ProfileScreen} />
          <Route path='/shipping' component={ShippingScreen} />
          <Route path='/placeorder' component={PlaceOrderScreen} />
          <Route path='/order/:id' component={OrderScreen} />
          <Route path='/myorders' component={OrderListScreen} />
          <Route path='/payment' component={PaymentScreen} />
          <Route path='/product/:id' component={ProductScreen} />
          <Route path='/cart/:id?' component={CartScreen} />

          <Route path='/restaurants/:id' component={RestaurantScreen} />
          <Route path='/restaurant-review/:id?' component={RestaurantReviewScreen} />

          <Route path='/reserve-table' component={CreateReservation} />
          <Route path='/reserve-add-ons' component={PreOrder} />
          <Route path='/reserve-confirm' component={ReserveConfirm} />
          <Route path='/my-reservations' component={ReservationListScreen} />
          <Route path='/reservations/:id' component={ReservationScreen} />

          <Route path='/admin/userlist' component={UserListScreen} />
          <Route path='/admin/user/:id/edit' component={UserEditScreen} />

          <Route path='/admin/productlist' component={ProductListScreen} />
          <Route path='/admin/product/:id/edit' component={ProductEditScreen} />

          <Route path='/driver' component={DriverDashboard} />
          <Route path='/driver-stats' component={DriverStats} />

        </Container>
        <Route path='/admin'
          render={ props =>
            <Admin hideHeader={hideHeader} />
          }
        />
        <Route path='/restaurant-owner' component={RestaurantOwner} />
      </main>
      <Footer />
    </Router>
  );
}

export default App;

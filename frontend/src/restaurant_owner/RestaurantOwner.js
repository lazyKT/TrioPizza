import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

import Dashboard from './Dashboard';
import Appbar from './Appbar';
import DrawerMenu from './DrawerMenu';
import ProductDashboard from './products/ProductDashboard';
import MyRestaurant from './restaurant_setting/MyRestaurant';
import { logout } from '../actions/userActions';


const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));


function switchContents (page) {
		switch (page) {
			case 'Dashboard':
				return <Dashboard />;
      case 'Products':
        return <ProductDashboard />;
      case 'Orders':
        return <h5>Orders</h5>;
      case 'Reservations':
        return <h5>Reservations</h5>;
      case 'Feature Products':
        return <h5>Feature Products</h5>;
      case 'Promo':
        return <h5>Promotions</h5>;
      case 'Restaurant Setting':
        return <MyRestaurant />;
      case 'Profile':
        return <h5>Owner Profile</h5>;
			default:
				throw new Error ('Invalid Admin Page Content');
		}
}


export default function OwnerDashboard () {

  const theme = useTheme();
  const [ open, setOpen ] = useState(true);
  const [ page, setPage ] = useState('Dashboard');
  const [ pageTitle, setPageTitle ] = useState('Dashboard');

  const dispatch = useDispatch();
  const history = useHistory();

  const { userInfo } = useSelector(state => state.userCookie);

  const onChangePage = (page) => {
    
		if (page === 'Sign Out') {
      // sign out user
      dispatch(logout());
    }
    else {
      setPage(page);
    }
	}

  useEffect(() => {
		setPageTitle(page);

    if (!userInfo)
      history.push('/');
    else {
      if (userInfo.type !== 'restaurant owner')
        history.push('/');
    }

	}, [open, page, dispatch, userInfo]);

  return (
    <Box sx={{display: 'flex'}}>
      <CssBaseline />

      <Appbar
        title={pageTitle}
        open={open}
        handleDrawerOpen={() => setOpen(true)}
      />

      <DrawerMenu
        theme={theme}
        open={open}
        handleDrawerClose={() => setOpen(false)}
        openedMixin={openedMixin}
        closedMixin={closedMixin}
        onChangePage={onChangePage}
        page={page}
      />

      <Box component="main" sx={{ flexGrow: 1, p: 3, background: '#f9f9f9' }}>
        <DrawerHeader />
        { switchContents(page) }
      </Box>
    </Box>
  );
}

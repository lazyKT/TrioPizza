import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

import AdminAppbar from './AdminAppbar';
import AdminDrawerMenu from './AdminDrawerMenu';
import Dashboard from './Dashboard';
import UserAdminDashboard from './users/UserAdminDashboard';
import ProductDashboard from './products/ProductDashboard';
import OrderDashboard from './orders/OrderDashboard';
import Profile from './Profile';
import Setting from './Setting';
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
			case 'Users':
				return <UserAdminDashboard />;
			case 'Products':
				return <ProductDashboard />;
			case 'Orders':
				return <OrderDashboard />;
      case 'Profile':
        return <Profile />
      case 'Setting':
        return <Setting />;
			default:
				throw new Error ('Invalid Admin Page Content');
		}
}


export default function Admin ({hideHeader}) {

  const theme = useTheme();
  const [ open, setOpen ] = useState(false);
	const [ page, setPage ] = useState('Dashboard');
	const [ pageTitle, setPageTitle ] = useState('Dashboard');

  const dispatch = useDispatch();
  const history = useHistory();

  const userCookie = useSelector(state => state.userCookie);
  const { userInfo } = userCookie;

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

	const onChangePage = (page) => {
    console.log(page);
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
    hideHeader();

    if (!userInfo)
      history.push('/');

	}, [open, page, hideHeader, dispatch, userInfo]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

			<AdminAppbar
				title={pageTitle}
				open={open}
				handleDrawerOpen={handleDrawerOpen}
			/>

      <AdminDrawerMenu
				theme={theme}
				open={open}
				handleDrawerClose={handleDrawerClose}
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

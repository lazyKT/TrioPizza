import React from 'react';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';

import GroupIcon from '@mui/icons-material/Group';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LogoutIcon from '@mui/icons-material/Logout';


const drawerWidth = 250;


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


const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open'
})(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);


function renderDrawerMenu (text, selected) {
  switch (text) {
    case 'Dashboard':
      return (
        <DashboardIcon color={text === selected ? "primary" : "gray"} />
      );
    case 'Users':
      return (
        <GroupIcon color={text === selected ? "primary" : "gray"}/>
      );
    case 'Drivers Status':
      return (
        <DeliveryDiningIcon color={text === selected ? 'primary' : 'gray'} />
      );
    case 'Restaurants':
      return (
        <RestaurantIcon color={text === selected ? "primary" : "gray"} />
      );
    case 'Profile':
      return (
        <AccountBoxIcon color={text === selected ? "primary" : "gray"} />
      );
    case 'Setting':
      return (
        <SettingsIcon color={text === selected ? "primary" : "gray"} />
      );
    case 'Sign Out':
      return (
        <LogoutIcon color={text === selected ? "primary" : "gray"} />
      );
    default:
      throw new Error ('Invalid Menu Button!');
  }
}


export default function AdminDrawerMenu (props) {

  const {
    open,
    handleDrawerClose,
    onChangePage,
    theme,
    page } = props;


  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {['Dashboard', 'Users', 'Drivers Status', 'Restaurants'].map((text, index) => (
          <ListItem button key={text} onClick={() => onChangePage(text)}>
            <ListItemIcon>
              { renderDrawerMenu(text, page) }
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['Profile', 'Setting', 'Sign Out'].map((text, index) => (
          <ListItem button key={text} onClick={() => onChangePage(text)}>
            <ListItemIcon>
              { renderDrawerMenu(text) }
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

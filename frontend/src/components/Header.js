import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import { Navbar, Nav, Container, NavDropdown, Alert, Button } from 'react-bootstrap';
import CircleIcon from '@mui/icons-material/Circle';
import { LinkContainer } from 'react-router-bootstrap';
import SearchBox from './SearchBox';

import { logout } from '../actions/userActions';
import { getDriverWorkingStatus, updateWorkingStatus } from '../networking/driverRequests';


function Header() {

  const [ showHeader, setShowHeader ] = useState(true);
  const [ loading, setLoading ] = useState(true);
  const [ isOnline, setIsOnline ] = useState(false);

  const { userInfo } = useSelector(state => state.userCookie);

  const dispatch = useDispatch();
  const history = useHistory();


  const logoutHandler = () => {
    dispatch(logout());
  }

  const changeWorkingStatus = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();
      const status = isOnline ? 'offline' : 'available';

      const { error, message, data } = await updateWorkingStatus(userInfo.id, status, userInfo.token);
      if (error) {
        setIsOnline(false);
      }
      else {
        if (data.status === 'offline')
          setIsOnline(false);
        else
          setIsOnline(true);
      }
    }
    catch (error) {
      setIsOnline(false);
    }
  }

  const getDriverStatus = async (driverId, token, signal) => {
    try {
      const { error, message, data } = await getDriverWorkingStatus(driverId, token, signal);
      if (error) {
        setIsOnline(false);
      }
      else {
        if (data.status === 'offline')
          setIsOnline(false);
        else
          setIsOnline(true);
      }
    }
    catch (error) {
      setIsOnline(false);
    }
  }

  useEffect(() => {

    const abortController = new AbortController();

    if (userInfo) {
      if (userInfo.type === 'admin' || userInfo.type === 'restaurant owner')
        setShowHeader(false);
      else {
        setShowHeader(true);
        if (userInfo.type === 'driver') {
          (async () => await getDriverStatus(userInfo.id, userInfo.token, abortController.signal))()
        }
      }
    }
    else {
      setShowHeader(true);
    }

    return (() => {
      if (abortController) abortController.abort();
    })
  }, [userInfo]);


  useEffect(() => {
    setLoading(false);
  }, [isOnline]);


  return (
    <>
      {showHeader ?(
        <header>
          <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
            <Container>
              <LinkContainer to='/'>
                <Navbar.Brand>TrioPizza</Navbar.Brand>
              </LinkContainer>

              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                { userInfo?.type !== 'driver' && <SearchBox />}
                <Nav className="ml-auto">

                  { userInfo && userInfo.type === 'customer' &&
                    <>
                    <LinkContainer to='/reserve-table'>
                      <Nav.Link >Reservation</Nav.Link>
                    </LinkContainer>
                    <LinkContainer to='/cart'>
                      <Nav.Link ><i className="fas fa-shopping-cart"></i>Cart</Nav.Link>
                    </LinkContainer>
                    </>
                  }

                  {userInfo ? (
                    <NavDropdown title={userInfo.name} id='username'>
                      <LinkContainer to='/profile'>
                        <NavDropdown.Item>Profile</NavDropdown.Item>
                      </LinkContainer>

                      {userInfo.type === 'driver' &&
                        <LinkContainer to='/driver-stats'>
                          <NavDropdown.Item>Stats</NavDropdown.Item>
                        </LinkContainer>
                      }

                      {userInfo.type === 'customer' &&
                      (
                        <>
                          <LinkContainer to='/myorders'>
                            <NavDropdown.Item>My Orders</NavDropdown.Item>
                          </LinkContainer>
                          <LinkContainer to='/my-reservations'>
                            <NavDropdown.Item>My Reservations</NavDropdown.Item>
                          </LinkContainer>
                        </>
                      )}

                      <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>

                    </NavDropdown>


                  ) : (
                    <LinkContainer to='/login'>
                      <Nav.Link><i className="fas fa-user"></i>Login</Nav.Link>
                    </LinkContainer>
                    )}

                  {userInfo && userInfo.type === 'driver' &&
                  <>
                    { loading
                      ? (<Button className="px-2 py-1 m-1" variant='secondary'>
                          <CircleIcon sx={{ fontSize: 10, marginBottom: '2px', marginRight: '5px' }}/>Loading
                        </Button>)
                      : <Button
                          className="px-2 py-1 m-1"
                          variant={isOnline ? 'success' : 'danger'}
                          onClick={changeWorkingStatus}
                        >
                          <CircleIcon sx={{ fontSize: 10, marginBottom: '2px', marginRight: '5px' }}/>
                          { isOnline ? 'Online' : 'Offline'}
                        </Button>
                    }
                  </>
                  }

                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>)
        : <></>
      }
    </>
  )
}

export default Header

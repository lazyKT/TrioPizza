import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import SearchBox from './SearchBox'
import { logout } from '../actions/userActions'

function Header() {

  const [ showHeader, setShowHeader ] = useState(true);

  const { userInfo } = useSelector(state => state.userCookie);

  const dispatch = useDispatch();
  const history = useHistory();


  const logoutHandler = () => {
    dispatch(logout());
  }

  useEffect(() => {
    
    if (userInfo) {
      if (userInfo.type === 'admin')
        setShowHeader(false);
      else
        setShowHeader(true);
    }
    else {
      setShowHeader(true);
    }
  }, [userInfo]);

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

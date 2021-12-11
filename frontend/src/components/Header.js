import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux'
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import SearchBox from './SearchBox'
import { logout } from '../actions/userActions'

function Header(props) {

  const [ showHeader, setShowHeader ] = useState(false);
  const [ user, setUser ] = useState(false);

  const userLogin = useSelector(state => state.userLogin)
  const { userInfo } = userLogin

  const dispatch = useDispatch()


  const logoutHandler = () => {
    dispatch(logout());
    Cookies.remove('user');
  }

  const readCookie = () => {
    try {
      const cookie = JSON.parse(Cookies.get('user'));
      return cookie;
    }
    catch (error) {
      return undefined;
    }
  }

  useEffect(() => {
    setShowHeader(props.show);

    if (props.show) {
      const cookie = readCookie();
      if (cookie)
        setUser(cookie);
      else
        setUser(null);
    }

  }, [showHeader, props.show, userInfo]);

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
                <SearchBox />
                <Nav className="ml-auto">

                  <LinkContainer to='/cart'>
                    <Nav.Link ><i className="fas fa-shopping-cart"></i>Cart</Nav.Link>
                  </LinkContainer>

                  {user ? (
                    <NavDropdown title={user.name} id='username'>
                      <LinkContainer to='/profile'>
                        <NavDropdown.Item>Profile</NavDropdown.Item>
                      </LinkContainer>

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

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import SearchBox from './SearchBox'
import { logout } from '../actions/userActions'

function Header(props) {

  const [ showHeader, setShowHeader ] = useState(false);

  const userLogin = useSelector(state => state.userLogin)
  const { userInfo } = userLogin

  const dispatch = useDispatch()


  useEffect(() => {
    setShowHeader(props.show);
  }, [showHeader, props.show]);

  const logoutHandler = () => {
    dispatch(logout())
  }

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

                  {userInfo ? (
                    <NavDropdown title={userInfo.name} id='username'>
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

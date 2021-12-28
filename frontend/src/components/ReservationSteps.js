import React, { useEffect, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';



export default function ReservationSteps ({selected}) {

  const [ active, setActive ] = useState(null);

  useEffect(() => {
    setActive(selected);
  }, [selected]);

  return (
    <Nav className='justify-content-center mb-4'>
      <LinkContainer to='/reserve-table'>
          <Nav.Link disabled={!(active === 'reserve')} >Reserve</Nav.Link>
      </LinkContainer>
      <LinkContainer to='/reserve-add-ons'>
          <Nav.Link>Add Ons</Nav.Link>
      </LinkContainer>
      <LinkContainer to='/reserve-confirm'>
          <Nav.Link disabled={!(active === 'confirm')}>Confirm</Nav.Link>
      </LinkContainer>
    </Nav>
  )
}

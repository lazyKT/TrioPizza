import React from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';



export default function ReservationSteps ({
  step1 = false,
  step2 = false,
  step3 = false
}) {

  return (
    <Nav className='justify-content-center mb-4'>
      <LinkContainer to='/reserve-table'>
          <Nav.Link disabled={!step1} >Reserve</Nav.Link>
      </LinkContainer>
      <LinkContainer to='/reserve-add-ons'>
          <Nav.Link disabled={!step2}>Add Ons</Nav.Link>
      </LinkContainer>
      <LinkContainer to='/reserve-confirm'>
          <Nav.Link disabled={!step3}>Confirm</Nav.Link>
      </LinkContainer>
    </Nav>
  )
}

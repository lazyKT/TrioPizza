import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'react-bootstrap';



export default function AddressCard ({addr}) {

  const [ address, setAddress ] = useState(null);

  useEffect(() => {
    if (addr) {
      setAddress(addr);
    }
  }, [addr]);


  return (
    <>
      { address && (
        <Card className='p-4 m-2'>
          <h5>{address.name}</h5>
          <p>Address</p>
          <h6>{address.address}</h6>
          <Row>
            <Col>
              <p>City</p>
              <h6>{address.city}</h6>
            </Col>
            <Col>
              <p>Postal Code</p>
              <h6>{address.postalCode}</h6>
            </Col>
            <Col>
              <p>Country</p>
              <h6>{address.country}</h6>
            </Col>
          </Row>
        </Card>
      )}
    </>
  );
}

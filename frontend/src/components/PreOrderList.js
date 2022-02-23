import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, ListGroup, Row, Col, Image, Button } from 'react-bootstrap';

import { RESERVATION_REMOVE_PREORDER_ITEM } from '../constants/reservationConstants';


export default function PreOrderList () {

  const dispatch = useDispatch();

  const { preOrderItems } = useSelector(state => state.reservation);

  const removeItem = (item) => {
    dispatch({
      type: RESERVATION_REMOVE_PREORDER_ITEM,
      payload: item
    });
  }

  // useEffect(() => {
  //   console.log('pre-order items', preOrderItems);
  // }, [preOrderItems]);

  return (
    <>
      {
        preOrderItems?.length > 0 &&
        (
          <Card className='mt-3 p-2'>
            <Card.Title>Pre-order Item(s)</Card.Title>
            <Card.Body>
              <ListGroup>
                { preOrderItems.map ((item, idx) => (
                  <ListGroup.Item key={idx}>
                    <Row>
                      <Col md={2}>
                          <Image style={{width: '50px', height: '50px'}}
                            src={`http://167.71.221.189${item.image}`} alt={item.name} fluid rounded />
                      </Col>

                      <Col>
                          {item.name}
                      </Col>

                      <Col md={4}>
                          {item.qty} X ${item.price} = ${(item.qty * item.price).toFixed(2)}
                      </Col>

                      <Col md={4}>
                        <Button variant='danger' onClick={() => removeItem(item)}>Remove</Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        )
      }
    </>
  );
}

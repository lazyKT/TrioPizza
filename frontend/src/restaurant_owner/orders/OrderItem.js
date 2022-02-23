import React from 'react';
import { Row, Col, ListGroup, Image } from 'react-bootstrap';

import Message from '../../components/Message';


const styles = {
  container: {
    padding: '10px'
  }
}


export default function OrderItem ({items}) {


  return (
    <ListGroup variant='flush'>
      <ListGroup.Item>
          {items.length === 0
            ? <Message variant='info'>Order is empty</Message>
            : (
                  <ListGroup variant='flush'>
                      {items.map((item, index) => (
                          <ListGroup.Item key={index}>
                              <Row>
                                  <Col md={1}>
                                      <Image style={{width: '50px', height: '50px'}}
                                        src={`http://167.71.221.189${item.product.image}`} fluid rounded />
                                  </Col>

                                  <Col>{item.name}</Col>

                                  <Col md={4}>
                                      {item.qty} X ${item.price} = ${(item.qty * item.price).toFixed(2)}
                                  </Col>
                              </Row>
                          </ListGroup.Item>
                      ))}
                  </ListGroup>
              )}
      </ListGroup.Item>
    </ListGroup>
  )
}

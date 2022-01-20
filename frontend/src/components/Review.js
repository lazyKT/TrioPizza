import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

import Rating from './Rating';


export default function Review ({ review }) {

  const toDateTime = (datetime) => {
    const dt = new Date(datetime);
    return `${dt.toDateString()} ${dt.toLocaleTimeString()}`;
  }

  return (
    <Card className="my-3 mx-1 p-2">

      <Card.Title className="text-muted pt-2 mx-3">
        <Rating value={review.rating}  color={'#f8e825'} />
      </Card.Title>

      { review.comment && (
        <Card.Subtitle className="text-muted pt-2 mx-3">
          {review.comment}
        </Card.Subtitle>
      )}

      <Card.Body className="text-secondary">
        <span>{review.user && review.user}</span>
        <small> on {toDateTime(review.created_at)}</small>
      </Card.Body>
    </Card>
  );
}

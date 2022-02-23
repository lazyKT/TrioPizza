import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';


export default function Restaurant ({restaurant}) {
  return (
    <Card className="my-3 p-3 rounded">
        <Link to={`/restaurants/${restaurant._id}`}>
            <Card.Img
              style={{ height: '200px' }}
              src={`http://167.71.221.189${restaurant.logo}`}
            />
        </Link>

        <Card.Body>
            <Link to={`/restaurants/${restaurant._id}`}>
                <Card.Title as="div">
                    <strong>{restaurant.name}</strong>
                </Card.Title>
            </Link>
        </Card.Body>
    </Card>
  )
}

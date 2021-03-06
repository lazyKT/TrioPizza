import React from 'react';
import { Carousel, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';


export default function RestaurantCarousel ({restaurants}) {

  return (
    <Carousel className="bg-primary">
      {restaurants.map(restaurant => (
          <Carousel.Item key={restaurant._id}>
              <Link to={`/restaurants/${restaurant._id}`}>
                  <Image src={`http://167.71.221.189${restaurant.logo}`} alt={restaurant.name} fluid />
                  <Carousel.Caption className='carousel.caption'>
                      <h4>{restaurant.name}</h4>
                  </Carousel.Caption>
              </Link>
          </Carousel.Item>
      ))}
    </Carousel>
  );
}

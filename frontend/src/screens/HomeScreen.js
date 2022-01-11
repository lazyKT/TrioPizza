import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap'
import Restaurant from '../components/Restaurant'
import Loader from '../components/Loader'
import Message from '../components/Message'
import Paginate from '../components/Paginate'
import RestaurantCarousel from '../components/RestaurantCarousel'
import { listProducts } from '../actions/productActions'
import { getAllRestaurants } from '../networking/restaurantRequests';


function HomeScreen () {

    const [ restaurants, setRestaurants ] = useState([]);
    const [ error, setError ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ page, setPage ] = useState(0);
    const [ pages, setPages ] = useState(0);

    const { userInfo } = useSelector(state => state.userCookie);

    const history = useHistory();
    let keyword = history.location.search;


    const fetchAllRestaurants = async (signal) => {
      try {
        const { error, data, message } = await getAllRestaurants(signal);

        if (error) {
          setError(message);
        }
        else {
          setRestaurants(data.restaurants);
          setPage(data.page);
          setPages(data.pages);
        }
      }
      catch (error) {
        setError(error.message);
      }
    }

    useEffect(() => {

      const abortController = new AbortController();

      (async () => await fetchAllRestaurants(abortController.signal))()

      if (userInfo) {
        if (userInfo.type === 'admin')
          history.push('/admin');
        else if (userInfo.type === 'restaurant owner')
          history.push('/restaurant-owner')
        else if (userInfo.type === 'driver')
          history.push('/driver');
      }

      return (() => {
        if (abortController) abortController.abort();
      })

    }, [userInfo, keyword]);

    useEffect(() => {
      setLoading(false);
    }, [error, restaurants])

    return (
        <div>
            {!keyword && <RestaurantCarousel restaurants={restaurants}/>}

            <h1>Latest Products</h1>
            {loading ? <Loader />
                : error ? <Message variant='danger'>{error}</Message>
                    :
                    <div>
                        <Row>
                            {restaurants.map(restaurant => (
                                <Col key={restaurant._id} sm={12} md={6} lg={4} xl={3}>
                                    <Restaurant restaurant={restaurant} />
                                </Col>
                            ))}
                        </Row>
                        <Paginate page={page} pages={pages} keyword={keyword} />
                    </div>
            }
        </div>
    );
}

export default HomeScreen

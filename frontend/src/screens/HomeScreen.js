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
import { getAllRestaurants, getFeaturedRestaurants, filterRestaurants } from '../networking/restaurantRequests';


const styles = {
  subHeader: {
    fontSize: '17px',
    fontWeight: '600',
    marginTop: '20px',
    textDecoration: 'underline',
    textDecorationColor: 'dodgerblue'
  }
}


function HomeScreen () {

    const [ featuredRestaurants, setFeaturedRestaurants ] = useState(null);
    const [ restaurants, setRestaurants ] = useState([]);
    const [ filter, setFilter ] = useState(null);
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

    const getFilteredRestaurants = async (signal, filter) => {
      try {
        const { error, data, message } = await filterRestaurants(signal, filter);

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

    const fetchFeaturedRestaurants = async (signal) => {
      try {
        const { error, data, message } = await getFeaturedRestaurants(userInfo.id, signal);

        if (error) {
          setError(message);
        }
        else {
          setFeaturedRestaurants(data);
        }
      }
      catch (error) {
        setError(error.message);
      }
    }

    useEffect(() => {

      const abortController = new AbortController();

      if (keyword) {
        setFilter((keyword.split('&')[0]).split('=')[1]);
      }
      else
        (async () => await fetchAllRestaurants(abortController.signal))();

      if (userInfo) {
        if (userInfo.type === 'admin')
          history.push('/admin');
        else if (userInfo.type === 'restaurant owner')
          history.push('/restaurant-owner');
        else if (userInfo.type === 'driver')
          history.push('/driver');

        if (!keyword)
          (async () => await fetchFeaturedRestaurants(abortController.signal))();
      }

      return () => {
        abortController.abort();
      };

    }, [userInfo, keyword]);

    useEffect(() => {
      setLoading(false);
    }, [error, restaurants])

    useEffect(() => {
      const abortController = new AbortController();

      if (filter) {
        console.log(filter);
        (async () => await getFilteredRestaurants(abortController.signal, filter))();
      }

      return () => {
        abortController.abort();
      };
    }, [filter]);

    return (
        <div>
            {!keyword && <RestaurantCarousel restaurants={restaurants}/>}

            { !keyword && userInfo && featuredRestaurants &&
              <>
                <p style={styles.subHeader}>Your Featured Restaurants</p>
                {loading ? <Loader />
                    : error ? <Message variant='danger'>{error}</Message>
                        :
                        <div>
                            <Row>
                                {featuredRestaurants.map(restaurant => (
                                    <Col key={restaurant._id} sm={12} md={6} lg={4} xl={3}>
                                        <Restaurant restaurant={restaurant} />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                }
              </>
            }

            <p style={styles.subHeader}>
              Restaurants
            </p>
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

            { filter && restaurants.length === 0 &&
              <Message variant='info'>
                {`No restaurant(s) found with keyword ${filter}`}
              </Message>
            }
        </div>
    );
}

export default HomeScreen

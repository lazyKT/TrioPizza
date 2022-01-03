import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col } from 'react-bootstrap'
import Product from '../components/Product'
import Loader from '../components/Loader'
import Message from '../components/Message'
import Paginate from '../components/Paginate'
import ProductCarousel from '../components/ProductCarousel'
import { listProducts } from '../actions/productActions'



function HomeScreen () {
    const dispatch = useDispatch()
    const { error, loading, products, page, pages } = useSelector(state => state.productList);
    const { userInfo } = useSelector(state => state.userCookie);

    const history = useHistory();
    let keyword = history.location.search


    useEffect(() => {

        if (userInfo) {
          if (userInfo.type === 'admin')
            history.push('/admin');
          else if (userInfo.type === 'driver')
            history.push('/driver');
        }

        dispatch(listProducts(keyword))

    }, [dispatch, keyword, userInfo]);

    return (
        <div>
            {!keyword && <ProductCarousel />}

            <h1>Latest Products</h1>
            {loading ? <Loader />
                : error ? <Message variant='danger'>{error}</Message>
                    :
                    <div>
                        <Row>
                            {products.map(product => (
                                <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                                    <Product product={product} />
                                </Col>
                            ))}
                        </Row>
                        <Paginate page={page} pages={pages} keyword={keyword} />
                    </div>
            }
        </div>
    )
}

export default HomeScreen

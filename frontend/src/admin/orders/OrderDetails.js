import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, Button, ButtonGroup, ListGroup } from 'react-bootstrap';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import MaterialButton from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { getOrderDetails, completeOrder, cancelOrder } from '../../networking/orderRequests';
import { getAvailableDrivers } from '../../actions/userActions';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import ConfirmationBox from '../../components/ConfirmationBox';
import AsignDriver from './AsignDriver';
import OrderItem from './OrderItem';


const styles = {
  paper: {
    margin: '10px',
    padding: '15px'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '15px',
    marginBottom: '15px'
  },
  rowStart: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: '15px'
  }
}


export default function OrderDetails ({id, backToOrderList}) {

  const [ order, setOrder ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);
  const [ driver, setDriver ] = useState(-1);
  const [ drivers, setDrives ] = useState([]);
  const [ showConfirmation, setShowConfirmation ] = useState(false);
  const [ actionType, setActionType ] = useState('');
  const [ confirmationText, setConfirmationText ] = useState('');

  const dispatch = useDispatch();

  const { userInfo } = useSelector(state => state.userCookie);


  const backButtonClick = (e) => {
    e.preventDefault();
    backToOrderList();
  };

  const toDate = (date) => {
    const dt = new Date(date);
    return `${dt.toLocaleDateString()}, ${dt.toLocaleTimeString()}`;
  };


  const handleCancelClick = (e) => {
    e.preventDefault();
    setActionType('cancel');
    setConfirmationText('Are you sure you want to cancel the order?')
    setShowConfirmation(true);
  };


  const handleDeliverClick = (e) => {
    e.preventDefault();
    setActionType('deliver');
    setConfirmationText('Mark the order as delivered?')
    setShowConfirmation(true);
  }


  const confirmActionClick = async () => {
    console.log(actionType, 'order #', id);
    setShowConfirmation(false);
    setLoading(true);
    if (actionType === 'cancel')
      await cancelOrderRequest();
    else if (actionType === 'deliver')
      await deliverOrderRequest();
  };


  const cancelOrderRequest = async () => {
    const { error, message, data } = await cancelOrder(id, userInfo.token);

    if (error) {
      setError(message);
    }
    else {
      setOrder(data);
    }
    setLoading(false);
  }


  const deliverOrderRequest = async () => {
    const { error, message, data } = await completeOrder(id, userInfo.token);

    if (error) {
      setError(message);
    }
    else {
      setOrder(data);
    }
    setLoading(false);
  }


  useEffect(() => {

    const abortController = new AbortController();

    if (id && userInfo && userInfo.isAdmin) {
      (async () => {
        const { error, message, data } = await getOrderDetails(id, userInfo.token, abortController.signal);
        if (error) {
          setError(message);
        }
        else {
          setOrder(data);
        }
        setLoading(false);
      })()
    }


    // clean up
    return (() => abortController.abort());
  }, [userInfo, id]);

  return (
    <>
      <MaterialButton
        endIcon={<ArrowBackIcon/>}
        onClick={backButtonClick}
      >
        Back
      </MaterialButton>
      {
        loading ? <Loader />
        : (
          error ? <Message variant='danger'>{error}</Message>
          : (
            <Paper
              sx={styles.paper}
            >
              {showConfirmation && (
                <ConfirmationBox
                  dismiss={() => setShowConfirmation(false)}
                  action={confirmActionClick}
                  text={confirmationText}
                />
              )}
              <Box
                sx={styles.row}
              >
                <h5>Order : #{id}</h5>
                <h6>Status : &nbsp;
                  <strong style={{
                    color: order.status === 'progress' ? 'coral' : 'dodgerBlue'
                  }}>
                    {order.status}
                  </strong>
                </h6>
              </Box>

              <AsignDriver
                id={id}
                driver={order.driver}
                status={order.status}
              />

              <Box
                sx={styles.row}
              >
                <div>
                  <p>Customer</p>
                  <h6>{order.user.name}, {order.user.username}</h6>
                </div>
                <div>
                  <p>Date & Time</p>
                  <h6>{toDate(order.createdAt)}</h6>
                </div>
              </Box>

              <Box>
                <p>Ordered Items</p>
                <OrderItem items={order.orderItems}/>
              </Box>

              {order && order.status === 'progress' && (
                <Box
                  sx={styles.rowStart}
                >
                  { order.driver && (
                    <Button
                      className="btn btn-success mr-1"
                      onClick={handleDeliverClick}
                    >
                      Mark as Derlivered
                    </Button>
                  )}
                  <Button
                    className="btn btn-secondary mx-1"
                    onClick={handleCancelClick}
                  >
                    Cancel Order
                  </Button>
                </Box>
              )}

            </Paper>
          )
        )
      }
    </>
  )
}

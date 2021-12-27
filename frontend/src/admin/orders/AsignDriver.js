import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button } from 'react-bootstrap';
import Box from '@mui/material/Box';
import axios from 'axios';

import Message from '../../components/Message';
import { asignDriverToOrder } from '../../networking/orderRequests';


export default function AsignDriver ({id, driver, status}) {

  const [ drivers, setDrivers ] = useState([]);
  const [ error, setError ] = useState(null);
  const [ selected, setSelected ] = useState(-1);
  const [ orderDriver, setOrderDriver ] = useState(null);

  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.userCookie);

  const handleOnChange = (e) => {
    setSelected(e.target.value);
  }


  const assignDriver = async (e) => {
    try {
      e.preventDefault();
      const { error, message } = await asignDriverToOrder(selected, id, userInfo.token);

      if (error) {
        setError(message);
      }
      else {
        setError(null);
        const selectedDriver = drivers.filter(d => d.driver.id === parseInt(selected));
        setOrderDriver(selectedDriver[0].driver);
      }
    }
    catch (error) {
      setError(error.message);
    }
  }
  

  const fetchAvailableDrivers = async (token, signal) => {
    try {
      const { data } = await axios.get('api/users/drivers/status/available', {
        headers: {
          'Content-Type' : 'application/json',
          Authorization: `Bearer ${token}`
        },
        signal
      });

      setError(null);
      setDrivers(data);
    }
    catch (error) {
      console.log(error.response);
      if (error.response && error.response.data.details)
        setError(error);
      else
        setError(error.message);
      setDrivers([]);
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    if (!driver && id && userInfo) {
      (async () => await fetchAvailableDrivers(userInfo.token, abortController.signal)) ()
    }

    setOrderDriver(driver);

    return(() => abortController.abort());
  }, [id, driver, userInfo, status]);


  return (
    <>
      <p>Driver</p>
      { error && <Message variant='danger'>{error}</Message>}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '10px'
        }}
      >
        {(!orderDriver && status === 'progress') ?
          (
            <>
              <select
                style={{
                  width: '40%',
                  padding: '10px',
                  border: 'gainsboro 0.6px solid',
                  borderRadius: '5px'
                }}
                value={selected}
                onChange={handleOnChange}
              >
                <option value={-1}>Choose Driver</option>
                { drivers.map(d => (
                  <option key={d._id} value={d.driver.id}>{d.driver.name}</option>
                ))}
              </select>
              <div>
                <Button
                  variant='primary'
                  onClick={assignDriver}
                >
                  Assign
                </Button>
                <Button variant='secondary'>Cancel</Button>
              </div>
            </>
          ) :
          <h6>{orderDriver ? orderDriver.name : '--'}</h6>
        }
      </Box>
    </>
  )
}

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';

import Message from '../../components/Message';
import Loader from '../../components/Loader';
import CustomTable from '../CustomTable';


import { getAllDriverStatus } from '../../networking/driverRequests';


const styles = {
  topContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    padding: '10px'
  },
  searchInput: {
    maxWidth: '200px'
  }
}

const columns = [
  { id: '_id', label: 'ID', maxWidth: 70 },
  { id: 'name', label: 'Name', minWidth: 170 },
  {
    id: 'status',
    label: 'Status',
    maxWidth: 150,
    align: 'right',
  },
  {
    id: 'current_order',
    label: 'Current Order',
    minWidth: 100,
    align: 'right',
  },
  {
    id: 'total_order',
    label: 'Num Deliveries',
    maxWidth: 170,
    align: 'right',
    format: (value) => value.toFixed(2),
  },
];


export default function UserList({addNewUser}) {

  const [ drivers, setDrivers ] = useState([]);
  const [ error, setError ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ message, setMessage ] = useState(null);

  const { userInfo } = useSelector(state => state.userCookie);

  useEffect(() => {
    const abortController = new AbortController();

    if (userInfo) {
      (async () => {
        setLoading (true);

        const { data, error, message } = await getAllDriverStatus(userInfo.token, abortController.signal);

        if (error) {
          setError(error);
        }
        else {
          setDrivers(data);
        }
        setLoading(false);
      })();
    }

    return (() => abortController.abort());
  }, [userInfo]);


  useEffect(() => {
    if (error) {
      setMessage(error);
    }
    else {
      if (!error && drivers.length === 0) {
        setMessage('Driver Lists Empty!');
      }
      else {
        setMessage(null);
      }
    }
  }, [error, drivers]);


  return (
    <>
      { message && <Message variant='info'>{message}</Message>}
      { loading && <Loader />}
      { drivers.length > 0 && <CustomTable
        rows={drivers}
        columns={columns}
        edit={() => {console.log('nothing!')}}
        type="driver"
      />}
    </>
  );
}

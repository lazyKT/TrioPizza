import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Card, Row, Col, Form } from 'react-bootstrap';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { getOrdersWithinTimeFrames } from '../../networking/orderRequests';


const styles = {
  paper: {
    padding: '10px',
    marginBottom: '10px'
  },
  headerDiv: {
    display: 'flex',
    width: '100%',
    paddingRight: '10px',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  heading: {
    fontSize: '17px',
    fontWeight: '600'
  }
}

export default function ExportOrders () {

  const [ error, setError ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const [ message, setMessage ] = useState(null);
  const [ showFilters, setShowFilters ] = useState(false);
  const [ filters, setFilters ] = useState({
    startDate : '',
    endDate : ''
  });
  const history = useHistory();
  const { userInfo } = useSelector(state => state.userCookie);
  const { restaurantInfo } = useSelector(state => state.restaurant);

  const handleOnChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name] : e.target.value
    })
  }

  const exportData = (data) => {

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const fileName = `orders_${filters.startDate}_${filters.endDate}`;

    const _data = data.map(d => {
      return {
        ...d,
        user: d.user?.name,
        driver: d.driver?.name,
        orderItems: d.orderItems.length,
        paidAt: `${(new Date(d.paidAt)).toLocaleDateString()}, ${(new Date(d.paidAt)).toLocaleTimeString()}`,
        deliveredAt: `${(new Date(d.deliveredAt)).toLocaleDateString()}, ${(new Date(d.deliveredAt)).toLocaleTimeString()}`,
        createdAt: `${(new Date(d.createdAt)).toLocaleDateString()}, ${(new Date(d.createdAt)).toLocaleTimeString()}`
      }
    });

    const ws = XLSX.utils.json_to_sheet(_data);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const xlsx = new Blob([excelBuffer], {type: fileType});
    FileSaver.saveAs(xlsx, fileName + fileExtension);
  }

  const handleOnSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);

      const { data, error, message } = await getOrdersWithinTimeFrames(
        restaurantInfo._id,
        filters.startDate,
        filters.endDate,
        userInfo.token
      );

      if (error)
        throw new Error(message);

      exportData(data);
      setError(null);
      setMessage('Data Exported into Excel File!')
    }
    catch (error) {
      setError(error.message);
      setMessage(null);
    }
  }

  useEffect(() => {
    if (!restaurantInfo || !userInfo) {
      history.push('/');
    }
  }, [restaurantInfo, userInfo]);

  useEffect(() => {
    setLoading(false);
  }, [message, error]);

  return (
    <Paper sx={styles.paper}>
      <div style={styles.headerDiv}>
        <p style={styles.heading}>Export Order Report</p>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          endIcon={showFilters ? <ArrowDropUpIcon/> : <ArrowDropDownIcon />}
        >
          { showFilters ? 'Collapse' : 'Expand'}
        </Button>
      </div>
      { showFilters && (
        <>
          { error && <Message variant='danger'>{error}</Message> }
          { message && <Message variant='info'>{message}</Message> }
          <Form onSubmit={handleOnSubmit}>
            <Form.Group className='mb-2'>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                className="w-50"
                type="date"
                name='startDate'
                placeholder="Enter Start Date"
                value={filters.startDate}
                onChange={handleOnChange}
                required
              />
            </Form.Group>
            <Form.Group controlId='expiry_date' className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                className="w-50"
                placeholder="Enter End Date"
                name='endDate'
                value={filters.endDate}
                onChange={handleOnChange}
                required
              />
            </Form.Group>
            <Button
              type='submit'
              variant='contained'
              endIcon={<FileDownloadIcon />}
              disabled={loading}
            >
              Export to Excel Sheet
            </Button>
          </Form>
        </>
      )}
    </Paper>
  );
}

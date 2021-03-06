import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import CustomTable from '../CustomTable';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import EditPromotion from './EditPromotion';
import { fetchPromotionsByRestaurant } from '../../networking/restaurantRequests';


const styles = {
  topContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    padding: '10px'
  },
  box: {
    width: '40%',
    maxWidth: '400px'
  },
  tableContainer: {
    padding: '10px'
  }
};


const columns = [
  { id: '_id', label: 'ID', maxWidth: 70 },
  { id: 'description', label: 'Description', minWidth: 170 },
  { id: 'product_name', label: 'Product', minWidth: 120},
  { id: 'status', label: 'Status', maxWidth: 80 },
  {
    id: 'type',
    label: 'Type',
    maxWidth: 100,
    align: 'right',
  },
  {
    id: 'amount',
    label: 'Promotion Amount',
    maxWidth: 120,
    align: 'right',
  },
  {
    id: 'expiry_date',
    label: 'Expiry Date',
    maxWidth: 150,
    align: 'right',
  },
];


function createData (promos) {
  return promos?.map(p => {
    return {
      ...p,
      amount: p.amount.toString(),
      expiry_date: (new Date(p.expiry_date)).toDateString()
    }
  });
}


export default function PromotionList ({openCreatePromotion}) {

  const [ promos, setPromos ] = useState(null);
  const [ editing, setEditing ] = useState(null);
  const [ error, setError ] = useState(null);
  const [ loading, setLoading ] = useState(true);

  const history = useHistory();
  const { restaurantInfo } = useSelector(state => state.restaurant);
  const { userInfo } = useSelector(state => state.userCookie);

  const fetchPromotions = async (restaurantId, token, signal) => {
    try {
        const { error, data, message} = await fetchPromotionsByRestaurant(restaurantId, token, signal);
        if (error) {
          setPromos(null);
          setError(message);
        }
        else {
          setError(null);
          setPromos(data);
        }
    }
    catch (error) {
      setError(error.message);
    }
  }

  const exportData = (e) => {
    e.preventDefault();

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const fileName = `promo_${(new Date()).toLocaleDateString()}${(new Date()).toLocaleTimeString()}`;

    const ws = XLSX.utils.json_to_sheet(promos);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: fileType});
    FileSaver.saveAs(data, fileName + fileExtension);
  }

  const editPromoCode = (val) => {
    setEditing(val);
  }

  useEffect(() => {
    const abortController = new AbortController();

    if (!userInfo)
      history.push('/');

    if (userInfo && restaurantInfo) {
      (async () => await fetchPromotions(restaurantInfo._id, userInfo.token, abortController.signal))();
    }

    return () => abortController.abort();
  }, [userInfo, restaurantInfo, editing]);

  useEffect(() => {
    if (promos || error)
      setLoading(false);
  }, [promos, error]);

  return (
    <div>
      {
        editing ? <EditPromotion id={editing} backToPromoList={() => setEditing(null)} />
        : (
          <>
          <Paper sx={styles.topContainer}>
            <Box sx={styles.box}>
              <TextField fullWidth label="Search" variant="outlined" size="small"/>
            </Box>

            <Box>
              <Button
                sx={{margin: '10px'}}
                variant="contained"
                color="success"
                onClick={() => openCreatePromotion()}
                endIcon={<AddIcon />}
              >
                Add
              </Button>
              <Button
                sx={{margin: '10px'}}
                variant="contained"
                endIcon={<FileDownloadIcon />}
                onClick={exportData}
              >
                Export
              </Button>
              <IconButton>
                <RefreshIcon color="primary" />
              </IconButton>
            </Box>
          </Paper>

          { loading && <Loader/> }
          { error && <Message variant="danger">{error}</Message>}

          {
            promos?.length === 0
            ? (
              <Paper sx={styles.tableContainer}>
                <h5 style={{ marginBottom: '20px'}}>Promotions</h5>
                <Message variant="info">You Don't Have Any Promotion Data Yet!</Message>
              </Paper>
            ) : (
              <CustomTable
              columns={columns}
              rows={createData(promos)}
              type='promos'
              edit={editPromoCode}
              />
            )
          }
        </>
      )
      }
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';

import CustomTable from '../CustomTable';
import EditProduct from './EditProduct';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { listRestaurantProducts } from '../../actions/productActions';


const styles = {
  topContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    padding: '10px'
  }
};


const columns = [
  { id: '_id', label: 'ID', maxWidth: 70 },
  { id: 'name', label: 'Name', minWidth: 200 },
  {
    id: 'description',
    label: 'Description',
    maxWidth: 180,
  },
  {
    id: 'price',
    label: 'Price',
    maxWidth: 100,
    align: 'right',
  }
];


export default function ProductList ({addNewProduct}) {

  const [ openEditProduct, setOpenEditProduct ] = useState(false);
  const [ editingID, setEditingID ] = useState(null);

  const dispatch = useDispatch();
  const { empty, restaurantInfo } = useSelector(state => state.restaurant);
  const { loading, error, products } = useSelector(state => state.productList);


  const editProduct = (val) => {
    setEditingID(val);
    setOpenEditProduct(true);
  }

  const closeOpenEditProduct = () => setOpenEditProduct(false);

  useEffect(() => {
    if (!openEditProduct) {
      if (!empty && restaurantInfo)
        dispatch( listRestaurantProducts(restaurantInfo._id) )
    }
  }, [openEditProduct, empty, restaurantInfo]);

  return (
    <>
      { openEditProduct ?
        (<EditProduct
            editingID={editingID}
            backToProductList={closeOpenEditProduct}
          />)
        : (
          <>
            <Paper sx={styles.topContainer}>
              <Box sx={{width: '40%', maxWidth: '400px'}}>
                <TextField fullWidth label="Search" variant="outlined" size="small"/>
              </Box>

              <Box>
                <Button
                  sx={{margin: '10px'}}
                  variant="contained"
                  color="success"
                  onClick={() => addNewProduct()}
                  endIcon={<AddIcon />}
                >
                  Add
                </Button>
                <Button sx={{margin: '10px'}} variant="contained" endIcon={<FileDownloadIcon />}>
                  Export
                </Button>
                <IconButton>
                  <RefreshIcon color="primary" />
                </IconButton>
              </Box>
            </Paper>
            <CustomTable
              columns={columns}
              rows={products}
              type='products'
              edit={editProduct}
            />
          </>
        )}
    </>
  );
}

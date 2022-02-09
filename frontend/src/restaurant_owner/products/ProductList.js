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
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import CustomTable from '../CustomTable';
import EditProduct from './EditProduct';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { listRestaurantProducts } from '../../actions/productActions';
import { searchProductsRequest } from '../../networking/productRequests';


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
  const [ filter, setFilter ] = useState('');
  const [ filteredProducts, setFilteredProducts ] = useState([]);

  const dispatch = useDispatch();
  const { empty, restaurantInfo } = useSelector(state => state.restaurant);
  const { loading, error, products } = useSelector(state => state.productList);
  const { userInfo } = useSelector(state => state.userCookie);


  const editProduct = (val) => {
    setEditingID(val);
    setOpenEditProduct(true);
  }

  const closeOpenEditProduct = () => setOpenEditProduct(false);

  const searchProducts = async (e) => {
    try {
      setFilter(e.target.value);
      const { data, error, message } = await searchProductsRequest(restaurantInfo._id, e.target.value, userInfo.token);

      if (error)
        throw new Error(message);
      else
        setFilteredProducts(data);
    }
    catch (error) {
      console.error(error);
    }
  }

  const exportData = (e) => {
    e.preventDefault();

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const fileName = `products_${(new Date()).toLocaleDateString()}${(new Date()).toLocaleTimeString()}`;

    const _products = products.map(product => {
      return {
        ...product,
        createdAt: `${(new Date(product.createdAt)).toLocaleDateString()}, ${(new Date(product.createdAt)).toLocaleTimeString()}`
      }
    });

    const ws = XLSX.utils.json_to_sheet(_products);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: fileType});
    FileSaver.saveAs(data, fileName + fileExtension);
  }

  useEffect(() => {
    const abortController = new AbortController();

    if (!openEditProduct) {
      if (!empty && restaurantInfo)
        dispatch( listRestaurantProducts(restaurantInfo._id, abortController.signal) );
    }

    return () => abortController.abort();
  }, [openEditProduct, empty, restaurantInfo, userInfo]);

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
                <TextField
                  fullWidth
                  label="Search"
                  variant="outlined"
                  size="small"
                  value={filter}
                  name='filter'
                  onChange={searchProducts}
                />
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
            <CustomTable
              columns={columns}
              rows={filter !== '' ? filteredProducts : products}
              type='products'
              edit={editProduct}
            />
          </>
        )}
    </>
  );
}

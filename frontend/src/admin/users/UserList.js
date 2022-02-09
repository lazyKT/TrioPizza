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
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import CustomTable from '../CustomTable';
import EditUser from './EditUser';
import { searchUsersRequest } from '../../networking/userRequests';
import { listUsers } from '../../actions/userActions';


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
  { id: 'id', label: 'ID', maxWidth: 70 },
  { id: 'name', label: 'Name', minWidth: 170 },
  {
    id: 'username',
    label: 'Email',
    minWidth: 170,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'mobile',
    label: 'Mobile',
    maxWidth: 150,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'type',
    label: 'User Type',
    minWidth: 100,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
  }
];




export default function UserList({addNewUser}) {

  const [ openEditUser, setOpenEditUser ] = useState(false);
  const [ editingID, setEditingID ] = useState(null);
  const [ filter, setFilter ] = useState('');
  const [ filteredResults, setFilteredResults ] = useState([]);

  const dispatch = useDispatch();

  const userList = useSelector(state => state.userList);
  const { loading, error, users } = userList;


  const editUser = (id) => {
    setEditingID(id);
    setOpenEditUser(true);
  }


  const handleAddButtonOnClick = (event) => {
    event.preventDefault();
    addNewUser();
  }

  const handleSearchBoxOnChange = async (e) => {
    try {
      setFilter(e.target.value);
      const { data, error, message } = await searchUsersRequest(e.target.value);
      if (error) {
        throw new Error(message);
      }
      else {
        setFilteredResults(data);
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  const exportData = (e) => {
    e.preventDefault();

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const fileName = `users_${(new Date()).toLocaleDateString()}${(new Date()).toLocaleTimeString()}`;

    const ws = XLSX.utils.json_to_sheet(users);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: fileType});
    FileSaver.saveAs(data, fileName + fileExtension);
  }

  useEffect(() => {
    if (!openEditUser) {
      dispatch(listUsers());
    }
  }, [openEditUser]);

  return (
    <>
    {openEditUser
      ? (
        <EditUser
          closeEditUser={() => setOpenEditUser(false)}
          editingID={editingID}
        />
      )
      : (
        <>
        {loading
          ? "Loading ..."
          : (
            <>
            { error
              ? "Error Loading Users"
              : (
                <>
                  <Paper
                    sx={styles.topContainer}
                  >
                    <Box sx={{width: '40%', maxWidth: '400px'}}>
                      <TextField
                        fullWidth
                        label="Search"
                        variant="outlined"
                        size="small"
                        placeholder='Search User(s) by Email'
                        name='filter'
                        value={filter}
                        onChange={handleSearchBoxOnChange}
                      />
                    </Box>

                    <Box>
                      <Button
                        sx={{margin: '10px'}}
                        variant="contained"
                        color="success"
                        onClick={handleAddButtonOnClick}
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
                    rows={filter !== '' ? filteredResults : users}
                    type="user"
                    edit={editUser}
                  />
                </>
              )
            }
            </>
          )
        }
        </>
      )
    }
    </>
  );
}

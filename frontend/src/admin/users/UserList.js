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

import CustomTable from '../CustomTable';
import EditUser from './EditUser';

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
    id: 'type',
    label: 'User Type',
    minWidth: 100,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'isAdmin',
    label: 'Admin',
    maxWidth: 170,
    align: 'right',
    format: (value) => value.toFixed(2),
  },
];


export default function UserList({addNewUser}) {

  const [ openEditUser, setOpenEditUser ] = useState(false);

  const dispatch = useDispatch();

  const userList = useSelector(state => state.userList);
  const { loading, error, users } = userList;

  useEffect(() => {
    if (!openEditUser) {
      dispatch(listUsers);
      console.log(error, users);
    }
  }, [openEditUser]);

  return (
    <>
    {openEditUser
      ? (
        <EditUser
          closeEditUser={() => setOpenEditUser(false)}
        />
      )
      : (
        <>
          <Paper
            sx={styles.topContainer}
          >
            <Box sx={{width: '40%', maxWidth: '400px'}}>
              <TextField fullWidth label="Search" variant="outlined" size="small"/>
            </Box>

            <Box>
              <Button
                sx={{margin: '10px'}}
                variant="contained"
                color="success"
                onClick={() => addNewUser()}
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
            rows={users}
            editUser={() => setOpenEditUser(true)}
          />
        </>
      )
    }
    </>
  );
}

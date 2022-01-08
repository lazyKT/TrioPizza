import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import FormContainer from '../../components/FormContainer';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { getUserDetails, updateUser, deleteUser } from '../../actions/userActions';
import { USER_UPDATE_RESET, USER_DELETE_RESET } from '../../constants/userConstants';



export default function EditUser ({closeEditUser, editingID}) {

  const [ message, setMessage ] = useState('');
  const [ user, setUser ] = useState({
    name: '',
    username: '',
    mobile: '',
    type: ''
  });

  const dispatch = useDispatch();
  const { error, loading, userDetails } = useSelector(state => state.userDetails);

  const userUpdate = useSelector(state => state.userUpdate);
  const { success } = userUpdate;

  const userDelete = useSelector(state => state.userDelete);
  const { loadingDelete, successDelete, errorDelete } = userDelete;

  const handleOnChange = (event) => {
    setUser({
      ...user,
      [event.target.name]: event.target.value
    });
  }

  function handleOnSubmit (event) {
    event.preventDefault();
    dispatch(updateUser(editingID, user));
  }


  function handleDelete (event) {
    event.preventDefault();
    dispatch(deleteUser(editingID));
  }


  useEffect(() => {
    if (editingID && editingID > 0) {
      dispatch(getUserDetails(editingID));
      dispatch({
        type: USER_UPDATE_RESET,
      });
      dispatch({
        type: USER_DELETE_RESET
      });
    }
  }, [editingID]);

  useEffect(() => {
    console.log('userInfo', userDetails);
    if (userDetails) {

      if (success)
        setMessage('User Updated Successfully!');
      else {
        setUser({
          name: userDetails.name,
          username: userDetails.username,
          mobile: userDetails.mobile,
          type: userDetails.type
        });
        setMessage('');
      }
    }

    return (() => {
      if (success)
        dispatch({
          type: USER_UPDATE_RESET,
        });
    });
  }, [userDetails, success]);


  useEffect(() => {
    if (successDelete) {
      closeEditUser();
    }

    return(() => {
      if (successDelete)
        dispatch({
          type: USER_DELETE_RESET
        });
    });
  }, [errorDelete, successDelete]);


  return (
    <>
      <Button
        startIcon={<ArrowBackIcon/>}
        onClick={() => closeEditUser()}
      >
        Back
      </Button>
      <h4>Edit User</h4>
      <Paper sx={{ margin: '10px', paddingTop: '20px', paddingBottom: '20px'}}>
        <FormContainer>
          {message !== '' && <Message variant='success'>{message}</Message>}
          {error && <Message variant='danger'>{error}</Message>}
          {errorDelete && <Message variant='danger'>{errorDelete}</Message>}
          {(loading || loadingDelete) && <Loader />}
          <Form onSubmit={handleOnSubmit}>

            <Form.Group controlId='name'>
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter Last Name"
                name='name'
                value={user.name}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group controlId='username'>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter Email Address"
                name='username'
                value={user.username}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group controlId='mobile'>
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter Mobile Number"
                name='mobile'
                value={user.mobile}
                onChange={handleOnChange}
              />
            </Form.Group>

            <Form.Group controlId='type'>
              <Form.Label>User Type</Form.Label>
              <Form.Control
                as="select"
                onChange={handleOnChange}
                name="type"
                value={user.type}
              >
                <option>Select User Type</option>
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
              </Form.Control>
            </Form.Group>

            <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
              <Button
                variant="contained"
                type="submit"
              >
                Save Changes
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
              >
                Delete User
              </Button>
            </Box>

          </Form>
        </FormContainer>
      </Paper>
    </>
  )
}

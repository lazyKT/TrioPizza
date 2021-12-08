import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import FormContainer from '../../components/FormContainer';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { getUserDetails, updateUser } from '../../actions/userActions';


export default function EditUser ({closeEditUser, editingID}) {

  const [ user, setUser ] = useState({
    name: '',
    username: '',
    mobile: '',
    type: ''
  });

  const dispatch = useDispatch();
  const userDetails = useSelector(state => state.userDetails);
  const { error, loading, userInfo } = userDetails;

  const userUpdate = useSelector(state => state.userUpdate);
  const { success } = userUpdate;

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


  useEffect(() => {
    if (editingID && editingID > 0) {
      dispatch(getUserDetails(editingID));
    }
  }, [editingID, success]);

  useEffect(() => {
    if (userInfo) {
      setUser({
        name: userInfo.name,
        username: userInfo.username,
        mobile: userInfo.mobile,
        type: userInfo.type
      });
    }
  }, [userInfo])


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
          {error && <Message variant='danger'>{error}</Message>}
          {loading && <Loader />}
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

            <Button
              type="submit"
              color="success"
              variant="contained"
            >
              Save Changes
            </Button>

          </Form>
        </FormContainer>
      </Paper>
    </>
  )
}

import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import { Card, Image, Button, Form, Stack } from 'react-bootstrap';

import FormContainer from '../../components/FormContainer';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { updateRestaurantInfo, getRestaurantInfo } from '../../actions/restaurantActions';
import { uploadNewLogo } from '../../networking/restaurantRequests';



const styles = {
  logoImgDiv: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '15px',
    position: 'relative'
  },
  logoImg: {
    height: '200px',
    width: '300px',
    border: '0.4px solid gainsboro',
    borderRadius: '10px'
  },
  uploadLogo: {
    position: 'absolute',
    fontSize: 75,
    top: '55px'
  }
}


export default function RestaurantDetails () {

  const [ restaurant, setRestaurant ] = useState(null);
  const [ editing, setEditing ] = useState(false);
  const [ logo, setLogo ] = useState(null);
  const [ uploadError, setUploadError ] = useState(null);
  const inputFile = useRef(null);
  const logoImg = useRef(null);

  const dispatch = useDispatch();
  const history = useHistory();

  const { userInfo } = useSelector(state => state.userCookie);
  const { error, empty, loading, restaurantInfo } = useSelector(state => state.restaurant);


  const openFile = () => {
    if (editing) {
      inputFile.current.click();
    }
  };


  // logo image onChange event
  const fileOnChange = (e) => {
    console.log(e.target.files);
    let img = e.target.files[0];
    setLogo(img);
    let reader = new FileReader();
    reader.addEventListener('load', e => {
      logoImg.current.src = e.target.result;
    });
    reader.readAsDataURL(img);
  }


  const handleOnChange = (e) => {
    setRestaurant({
      ...restaurant,
      [e.target.name] : e.target.value
    })
  }


  const uploadLogo = async () => {
    try {
      console.log('uploading Logo');
      const formData = new FormData();
      formData.append('logo', logo, logo.name);

      const { error, message } = await uploadNewLogo (restaurant._id, formData, userInfo.token);

      if (error) {
        setUploadError(message);
      }
      else {
        setUploadError(null);
        setLogo(null);
      }
    }
    catch (error) {
      console.error(error);
      setUploadError(error.message);
    }
  }


  const handleOnSubmit = async (e) => {
    e.preventDefault();
    console.log(userInfo.id, restaurant, logo);

    if (logo) {
      // upload new logo
      await uploadLogo();
    }

    dispatch(updateRestaurantInfo(
      restaurant._id,
      {
        owner: userInfo.id,
        name: restaurant.name,
        description: restaurant.description
      },
      userInfo.token
    ));
  }

  useEffect(() => {
    if (!userInfo) {
      history.push('/');
    }

    if (restaurantInfo)
      setRestaurant(restaurantInfo);
  }, [userInfo, error, empty, loading, restaurantInfo]);

  useEffect(() => {

    if (!editing && restaurantInfo) {
      console.log('editing false!');
      setRestaurant(restaurantInfo);
      setLogo(null);
      if (logoImg && logoImg.current)
        logoImg.current.src = restaurantInfo.logo;
    }
  }, [editing]);

  return (
    <>
      {loading && <Loader/>}
      {error && <Message variant='danger'>{error}</Message>}
      {uploadError && <Message variant='danger'>{uploadError}</Message>}
      {empty && <Message variant='info'>You have not set up your restaurant yet!</Message>}
      {restaurant && (
        <Card>
          <Card.Body>
            <div
              style={styles.logoImgDiv}

            >
              <Image
                style={{
                  ...styles.logoImg,
                  opacity: editing ? 0.7 : 1,
                  cursor: editing ? 'pointer' : 'default'
                }}
                src={restaurant.logo}
                alt={restaurant.name}
                ref={logoImg}
                onClick={openFile}
                fluid
              />
              <input type='file' onChange={fileOnChange} ref={inputFile} style={{display: 'none'}}/>
              {editing && <InsertPhotoIcon sx={styles.uploadLogo} onClick={openFile}/>}
            </div>

            <FormContainer>
              <Form onSubmit={handleOnSubmit}>

                <Form.Group controlId='name'>
                  <Form.Label>Restaurant Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Beef Pepperoni"
                    name='name'
                    value={restaurant.name}
                    onChange={handleOnChange}
                    readOnly={!editing}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId='description'>
                  <Form.Label>Restaurant Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    required
                    type="text"
                    placeholder="Tasty Pizza with Pineapple"
                    name='description'
                    value={restaurant.description}
                    onChange={handleOnChange}
                    readOnly={!editing}
                  />
                </Form.Group>

                { !editing && (
                  <Button
                    variant="primary"
                    className="mr-1"
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </Button>
                )}

                {editing && (
                  <div>
                    <Button
                      variant="success"
                      className="mr-1 "
                      type="submit"
                    >
                      Save
                    </Button>
                    <Button
                      variant="light"
                      className="mx-1"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

              </Form>
            </FormContainer>
          </Card.Body>
        </Card>
      )}
    </>
  );
}

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';

import Loader from '../components/Loader';
import Message from '../components/Message';
import AddressCard from '../components/AddressCard';
import AddNewPlaceForm from '../components/AddNewPlaceForm';
import { getUserSavedAddresses, saveNewAddress } from '../networking/addressRequests';


export default function SavedPlaces () {

  const [ addresses, setAddresses ] = useState([]);
  const [ error, setError ] = useState(null);
  const [ message, setMessage ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ addNewPlace, setAddNewPlace ] = useState(false);

  const { userInfo } = useSelector(state => state.userCookie);

  const saveNewAddressRequest = async (newPlace) => {
    try {
      setLoading(true);
      const { data, message, error } = await saveNewAddress(newPlace, userInfo.id, userInfo.token);

      if (error) {
        setError(error);
      }
      else {
        setAddNewPlace(false);
        setAddresses([
          ...addresses,
          data
        ]);
      }
      setLoading(false);
    }
    catch (error) {
      setError(error.message);
    }
  }

  useEffect(() => {

    const abortController = new AbortController();

    if (userInfo) {
      (async () => {
        const { message, error, data } = await getUserSavedAddresses(
          userInfo.id,
          userInfo.token,
          abortController.signal);
        if (error) {
          setError(error);
        }
        else {
          setAddresses(data);
        }
        setLoading(false);
      })()
    }

    return (() => abortController.abort());

  }, [userInfo]);


  useEffect(() => {
    if (error) {
      setMessage(error);
    }
    else {
      if (addresses.length === 0)
        setMessage('You don\'t have any saved place(s).')
      else
        setMessage(null);
    }
  }, [error, addresses])

  return (
    <>
      <h2>Saved Places</h2>
      { addNewPlace ? (
        <AddNewPlaceForm
          dismissForm={() => setAddNewPlace(false)}
          handleOnSubmit={(newPlace) => saveNewAddressRequest(newPlace)}
        />
      ) : (
        <Button
          onClick={() => setAddNewPlace(true)}
          className='btn btn-info'>
          Add New Place
        </Button>
      )}
      { loading && <Loader />}
      { message && <Message variant='info'>{message}</Message>}
      { addresses.map( (addr, idx) => (
        <AddressCard key={idx} addr={addr} />
      ))}
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import Message from '../../components/Message';
import Loader from '../../components/Loader';
import CustomTable from '../CustomTable';
import { getAllRestaurants } from '../../networking/restaurantRequests';


const columns = [
  { id: '_id', label: 'ID', maxWidth: 70 },
  { id: 'name', label: 'Name', minWidth: 130 },
  {
    id: 'description',
    label: 'Description',
    maxWidth: 130,
    align: 'right'
  },
  {
    id: 'owner_name',
    label: 'Owner',
    maxWidth: 140,
    align: 'right',
  },
  {
    id: 'address',
    label: 'Address',
    minWidth: 120,
  },
  {
    id: 'created_at',
    label: 'Created On',
    maxWidth: 120,
    align: 'right',
  },
];

function createData (restaurants) {
  return restaurants?.map(restaurant => {
    return {
      ...restaurant,
      created_at: (new Date(restaurant?.created_at)).toLocaleDateString(),
      address: `${restaurant.locations[0]?.address}, ${restaurant.locations[0]?.district}, ${restaurant.locations[0]?.postal_code}`
    }
  });
}




export default function RestaurantDashboard () {

  const [ restaurants, setRestaurants ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);

  const { userInfo } = useSelector(state => state.userCookie);
  const history = useHistory();

  const fetchAllRestaurants = async (signal) => {
    try {
      const { data, error, message } = await getAllRestaurants(signal, 'all');

      if (error) {
        setRestaurants(null);
        setError(message);
      }
      else {
        setError(null);
        setRestaurants(data);
      }
    }
    catch (error) {
      setError(error.message);
    }
  }


  useEffect(() => {

    const abortController = new AbortController();

    if (!userInfo) {
      history.push('/login');
    }
    else {
      (async () => await fetchAllRestaurants(abortController.signal))();
    }

    return () => abortController.abort();

  }, [userInfo]);

  useEffect(() => {
    if (error || restaurants)
      setLoading(false);
  }, [restaurants, error]);

  return (
    <div>
      { error && <Message variant='danger'>{error}</Message> }
      { loading && <Loader/> }
      { restaurants?.length === 0 && <Message variant='info'>No registered restaurants</Message> }
      { restaurants?.length > 0 && (
        <CustomTable
          rows={createData(restaurants)}
          columns={columns}
          edit={() => {console.log('nothing!')}}
          type="restaurants"
        />
      )}
    </div>
  )
}

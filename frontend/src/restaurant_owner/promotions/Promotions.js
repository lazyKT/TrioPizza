import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import CreatePromotion from './CreatePromotion';
import PromotionList from './PromotionList';
import Message from '../../components/Message';


export default function Promotions () {

  const history = useHistory();

  const [ openCreatePromo, setOpenCreatePromo ] = useState(false);

  const { userInfo } = useSelector(state => state.userCookie);
  const { empty, loading, erorr } = useSelector(state => state.restaurant);

  useEffect(() => {
    if (!userInfo)
      history.push('/');
  }, [history, userInfo, openCreatePromo, empty, loading, erorr]);

  return (
    <>
      {
        empty
        ? <Message variant='info'>You have not set up the restaurant yet!</Message>
        : (
          <div>
            {
              openCreatePromo
              ? <CreatePromotion backToPromoList={() => setOpenCreatePromo(false)}/>
              : <PromotionList openCreatePromotion={() => setOpenCreatePromo(true)}/>
            }
          </div>
        )
      }
    </>
  )
}

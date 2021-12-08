import React, { useState, useEffect } from 'react';

import UserList from './UserList';
import CreateUser from './CreateUser';

export default function UserAdminDashboard () {

  const [ openCreateUser, setOpenCreateUser ] = useState(false);

  const addNewUser = () => {
    console.log('addNewUser', openCreateUser);
    setOpenCreateUser(true);
  }

  const backToUserList = () => setOpenCreateUser(false);

  useEffect(() => {
    console.log('openCreateUser', openCreateUser);
  }, [openCreateUser]);

  return (
    <>
    {openCreateUser
      ? <CreateUser backToUserList={backToUserList}/>
      : <UserList addNewUser={addNewUser}/>
    }
    </>
  )
}

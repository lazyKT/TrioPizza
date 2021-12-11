import React, { useState } from 'react';

import UserList from './UserList';
import CreateUser from './CreateUser';

export default function UserAdminDashboard () {

  const [ openCreateUser, setOpenCreateUser ] = useState(false);

  const addNewUser = () => {
    setOpenCreateUser(true);
  }

  const backToUserList = () => setOpenCreateUser(false);

  return (
    <>
    {openCreateUser
      ? <CreateUser backToUserList={backToUserList}/>
      : <UserList addNewUser={addNewUser}/>
    }
    </>
  )
}

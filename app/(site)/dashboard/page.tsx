import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import TwoTestComponent from './components/TwoTestComponent';
import getUsers from '@/app/actions/getUsers';

const page = async () => {


    const session = await getServerSession(authOptions);
    const users = await getUsers();



  return (
    <div>
        <h1>Dashboard Page</h1>
        <p>Session: {JSON.stringify(session)}</p>
        <TwoTestComponent users={users}/>
    </div>
  )
}

export default page
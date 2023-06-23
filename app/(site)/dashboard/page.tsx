import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const page = async () => {


    const session = await getServerSession(authOptions);



  return (
    <div>
        <h1>Dashboard Page</h1>
        <p>Session: {JSON.stringify(session)}</p>
    </div>
  )
}

export default page
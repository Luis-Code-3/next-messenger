import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {redirect} from "next/navigation";

const page = async () => {


    const session = await getServerSession(authOptions);

    if(session?.user.isNewUser === true) {
        redirect('/setUsername');
    }



  return (
    <div>
        <h1>Dashboard Page</h1>
        <p>Session: {JSON.stringify(session)}</p>
    </div>
  )
}

export default page
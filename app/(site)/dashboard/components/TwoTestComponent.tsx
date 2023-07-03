"use client"

import { useState } from "react";
import axios from "axios";
import { User } from "@prisma/client";

type TestComponentProps = {
    users: User[]
}


const TwoTestComponent = ({users}: TestComponentProps) => {

    const conversationId = "";
    const [username, setUsername] = useState('');

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://localhost:3000/api/users/pinned/", {conversationId});
            console.log(response);
        } catch (error: any) {
            console.log(error.response.data.message);
        }
    };

  return (
    <form onSubmit={handleSubmit}>

    <input type="text" name='name' placeholder='Name' onChange={(e) => setUsername(e.target.value)}></input>

        <button type="submit">new</button>
    </form>
  )
}

export default TwoTestComponent

//name, isGroup, image, memberIds, admin
"use client"

import { useState } from "react";
import axios from "axios";
import { User } from "@prisma/client";

type TestComponentProps = {
    users: User[]
}


const TestComponent = ({users}: TestComponentProps) => {

    const [name, setName] = useState('');
    const [isGroup, setIsGroup] = useState(false);
    const [image, setImage] = useState('');
    const [memberIds, setMemberIds] = useState<string[]>([]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://localhost:3000/api/conversations/", {name, isGroup, image, memberIds});
            console.log(response);
        } catch (error: any) {
            console.log(error.response.data.message);
        }
    };

    const handleMemberChange = (e: any) => {
        const selectedUsers = Array.from(e.target.selectedOptions, (option: any) => option.value);
        setMemberIds(selectedUsers);
    }





  return (
    <form onSubmit={handleSubmit}>
        <input type="text" name='name' placeholder='Name' onChange={(e) => setName(e.target.value)}></input>

        <input type="text" name='image' placeholder='Image' onChange={(e) => setImage(e.target.value)}></input>

        <input type="checkbox" name='isGroup' checked={isGroup} onChange={(e) => setIsGroup(prev => !prev)}></input>

        <select multiple={true} onChange={handleMemberChange}>
            {users.map((user) => {
                return <option key={user.id} value={user.id}>
                    {user.username}
                </option>
            })}
        </select>

        <button type="submit">submit</button>
    </form>
  )
}

export default TestComponent

//name, isGroup, image, memberIds, admin
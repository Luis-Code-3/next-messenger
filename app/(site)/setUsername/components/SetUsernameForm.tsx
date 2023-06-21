"use client"
import { useState } from "react"
import axios from "axios"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { FaUserAlt } from "react-icons/fa"
import styles from "./setUsernameForm.module.css"

const SetUsernameForm = () => {

    const {data: session, status, update} = useSession();
    const [username, setUsername] = useState('');
    const email = session?.user.email;
    const router = useRouter();

    const handleSubmit = async(e:any) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:3000/api/changeUsername", {username, email});
            await update();
            router.push('/dashboard')
        } catch (err: any) {
            toast.error(err.response.data.message)
        }
    }



  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>

        <div className={styles.nameBox}>
          <div><FaUserAlt/></div>
          <input required type="text" name='username' placeholder='Username' onChange={(e) => setUsername(e.target.value)}></input>
        </div>

            <button className={styles.newButton} type="submit">Create Username</button>

    </form>
  )
}

export default SetUsernameForm
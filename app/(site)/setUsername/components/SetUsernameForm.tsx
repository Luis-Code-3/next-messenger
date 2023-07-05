"use client"
import { useState } from "react"
import axios from "axios"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { FaUserAlt } from "react-icons/fa"
import styles from "./setUsernameForm.module.css"
import { PropagateLoader } from "react-spinners"

const SetUsernameForm = () => {

    const {data: session, status, update} = useSession();
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const email = session?.user.email;
    const router = useRouter();

    const handleSubmit = async(e:any) => {
        setIsLoading(true);
        e.preventDefault();
        try {
            await axios.post("http://localhost:3000/api/users/changeUsername", {username, email});
            await update({username});
            setIsNavigating(true); //might remove, same reason as others. Might be okay to accep t the flicker
            router.push('/dashboard/conversations')
        } catch (err: any) {
            toast.error(err.response.data.message)
        } finally {
            setIsLoading(false);
        }
    }



  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>

        <div className={styles.nameBox}>
          <div><FaUserAlt/></div>
          <input required type="text" name='username' placeholder='Username' onChange={(e) => setUsername(e.target.value)}></input>
        </div>

        {
            isLoading || isNavigating ? 
            <PropagateLoader size={14} className={styles.loader} color="#afa8c1"/>
            :
            <button className={styles.newButton} type="submit">Create Username</button>
        }

    </form>
  )
}

export default SetUsernameForm
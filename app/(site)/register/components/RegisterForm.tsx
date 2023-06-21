"use client"
import styles from "./register.module.css"
import { FaGithub, FaGoogle, FaUserAlt, FaLock, FaEnvelope, FaIdCard } from "react-icons/fa"
import { useState } from "react"
import { signIn } from "next-auth/react"
import axios from "axios"
import { toast } from "react-hot-toast"
import { ClipLoader, PropagateLoader } from "react-spinners"

const RegisterForm = () => {

    const [name, setName] = useState('');
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    const handleRegister = async (e:any) => {
        setIsLoading(true);
        e.preventDefault();
        try {
            await axios.post("http://localhost:3000/api/register", {username, email, name, password});
            setIsNavigating(true); //might remove cause it could cause issues if there is an error via signIn
            signIn('credentials', {email, password, callbackUrl: '/dashboard'})
        } catch (err: any) {
            toast.error(err.response.data.message)
        } finally {
            setIsLoading(false);
        }

    };

    const socialLogin = async (action: string) => {
        setIsLoading(true);
        setIsNavigating(true);
        signIn(action, {callbackUrl: '/dashboard'})
        .finally(() => {
            setIsLoading(false);
        })
    };



  return (
    <>
    <form className={styles.formContainer} onSubmit={handleRegister}>
        <div className={styles.nameBox}>
          <div><FaIdCard/></div>
          <input required type="text" name='name' placeholder='Name' onChange={(e) => setName(e.target.value)}></input>
        </div>

        <div className={styles.nameBox}>
          <div><FaUserAlt/></div>
          <input required type="text" name='username' placeholder='Username' onChange={(e) => setUsername(e.target.value)}></input>
        </div>

        <div className={styles.emailBox}>
          <div><FaEnvelope/></div>
          <input required type="email" name='email' placeholder='Email' onChange={(e) => setEmail(e.target.value)}></input>
        </div>

        <div className={styles.passBox}>
          <div><FaLock/></div>
          <input required type="password" name='password' placeholder='Password' onChange={(e) => setPassword(e.target.value)}></input>
        </div>
        
        {
            isLoading || isNavigating ?
            <PropagateLoader size={14} className={styles.loader} color="#afa8c1"/>
            : 
            <button className={styles.registerButton} type='submit'>Register</button>
        }
    </form>

      <div className={styles.orLine}></div>

      <div className={styles.socialContainer}>
        {
            isLoading || isNavigating ? 
            <>
            <div className={styles.socialBox}><ClipLoader color="#afa8c1"/></div>
            <div className={styles.socialBox}><ClipLoader color="#afa8c1"/></div>
            </>
            :
            <>
            <div className={styles.socialBox} onClick={() => socialLogin('github')}><FaGithub className={styles.svg}/></div>
            <div className={styles.socialBox} onClick={() => socialLogin('google')}><FaGoogle className={styles.svg}/></div>
            </>
        }
      </div>
    </>
  )
}

export default RegisterForm
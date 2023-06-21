"use client"
import styles from "./register.module.css"
import { FaGithub, FaGoogle, FaUserAlt, FaLock, FaEnvelope, FaIdCard } from "react-icons/fa"
import { useState } from "react"
import { signIn } from "next-auth/react"
import axios from "axios"
import { toast } from "react-hot-toast"

const RegisterForm = () => {

    const [name, setName] = useState('');
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e:any) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:3000/api/register", {username, email, name, password});
            signIn('credentials', {email, password, callbackUrl: '/dashboard'});
        } catch (err: any) {
            toast.error(err.response.data.message)
        }

    };

    const socialLogin = async (action: string) => {
        signIn(action, {callbackUrl: '/dashboard'});
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
        
        <button className={styles.registerButton} type='submit'>Register</button>
    </form>

      <div className={styles.orLine}></div>

      <div className={styles.socialContainer}>
        <div className={styles.socialBox} onClick={() => socialLogin('github')}><FaGithub className={styles.svg}/></div>
        <div className={styles.socialBox} onClick={() => socialLogin('google')}><FaGoogle className={styles.svg}/></div>
      </div>
    </>
  )
}

export default RegisterForm
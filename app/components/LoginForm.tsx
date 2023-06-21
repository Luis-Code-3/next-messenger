"use client"
import styles from "./loginForm.module.css"
import { FaGithub, FaGoogle, FaLock, FaEnvelope } from "react-icons/fa"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { signIn } from "next-auth/react"

const LoginForm = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e:any) => {
        //loading true
        e.preventDefault();
        signIn('credentials', {email, password, redirect: false})
            .then((callback) => {
                if(callback?.error) {
                    toast.error("Invalid Credentials");
                }

                if(callback?.ok && !callback?.error) {
                    window.location.href = '/dashboard';
                }
            })
            .finally(() => {
                // loading false
            })
    };

    const socialLogin = async (action: string) => {
        signIn(action, {callbackUrl: '/dashboard'})
    };



  return (
    <>
    <form className={styles.formContainer} onSubmit={handleLogin}>
        <div className={styles.emailBox}>
          <div><FaEnvelope/></div>
          <input required type="email" name='email' placeholder='Email' onChange={(e) => setEmail(e.target.value)}></input>
        </div>

        <div className={styles.passBox}>
          <div><FaLock/></div>
          <input required type="password" name='password' placeholder='Password' onChange={(e) => setPassword(e.target.value)}></input>
        </div>
        
        <button className={styles.logButton} type='submit'>Login</button>
    </form>

      <div className={styles.orLine}></div>

      <div className={styles.socialContainer}>
        <div className={styles.socialBox} onClick={() => socialLogin('github')}><FaGithub className={styles.svg}/></div>
        <div className={styles.socialBox} onClick={() => socialLogin('google')}><FaGoogle className={styles.svg}/></div>
      </div>
    </>
  )
}

export default LoginForm
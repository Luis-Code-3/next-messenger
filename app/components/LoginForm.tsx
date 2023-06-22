"use client"
import styles from "./loginForm.module.css"
import { FaGithub, FaGoogle, FaLock, FaEnvelope } from "react-icons/fa"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { signIn } from "next-auth/react"
import { ClipLoader, PropagateLoader } from "react-spinners"
import { useSearchParams } from "next/navigation"

const LoginForm = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const searchParams = useSearchParams();
    

    const handleLogin = async (e:any) => {
        //loading true
        setIsLoading(true);
        e.preventDefault();
        signIn('credentials', {email, password, redirect: false})
            .then((callback) => {
                if(callback?.error === "Invalid Credentials" || callback?.error === "Missing Fields") {
                    toast.error(callback?.error);
                }

                if(callback?.ok && (callback?.error === "OAuthAccountNotLinked" || callback?.error === "access_denied")) {
                  setIsNavigating(true); // might remove this, this is to prevent isLoading false flicker
                  window.location.href = '/dashboard';
                } // needed to add this because of a bug that was created when the url has an error query, ends up showing in the callback object

                if(callback?.ok && !callback?.error) {
                    setIsNavigating(true); // might remove this, this is to prevent isLoading false flicker
                    window.location.href = '/dashboard';
                }
            })
            .finally(() => {
                // loading false
                setIsLoading(false)
            })
    };

    const socialLogin = async (action: string) => {
        setIsLoading(true);
        setIsNavigating(true); //might need to handle signIn error
        signIn(action, {callbackUrl: '/dashboard'})
            .finally(() => {
                setIsLoading(false);
            })
    };

    const errorMessage = () => {
      const errorType = searchParams.get('error');
      if(errorType === 'OAuthAccountNotLinked') {
        return <p className={styles.errorMessage}>Confirm your Identity. Sign In with the same Account you Originally signed in with</p>
      }

      return <p className={styles.errorMessage}>Authorization Rejected. Try Again</p>
    }



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
        
        {
            isLoading || isNavigating ?
                <PropagateLoader size={14} className={styles.loader} color="#afa8c1"/>
            : <button className={styles.logButton} type='submit'>Login</button>
        }
        {/* <button className={styles.logButton} type='submit'>Login</button> */}
    </form>

      {
        searchParams.get('error') ?
        errorMessage()
        :
        null
      }

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

export default LoginForm

//?error=access_denied

//error=OAuthAccountNotLinked happens when we already have a social login with the same email as another social login wants to register

//error=OAuthAccountNotLinked happens when we already have a regular login with the same email as a social login wants to reigster

//error=OAuthAccountNotLinked happens when i try to do a google login with an already github login with same email
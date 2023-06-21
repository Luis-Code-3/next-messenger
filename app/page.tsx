import styles from './page.module.css'
import LoginForm from './components/LoginForm'
import Link from 'next/link'
import { FaFacebookMessenger } from 'react-icons/fa'

export default function Login() {


  
  return (
    <section className={styles.secContainer}>
      <div className={styles.loginContainer}>
        <FaFacebookMessenger className={styles.logoSvg}/>
        <LoginForm/>
        <p className={styles.registerPage}>Need To Register an <Link href={'/register'}>Account</Link>?</p>
      </div>
    </section>
  )
}

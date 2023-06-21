import RegisterForm from "./components/RegisterForm"
import styles from "./page.module.css"
import Link from "next/link"
import { FaFacebookMessenger } from "react-icons/fa"

const page = () => {
  return (
    <section className={styles.secContainer}>
      <div className={styles.registerContainer}>
        <FaFacebookMessenger className={styles.logoSvg}/>
        <RegisterForm/>
        <p className={styles.loginPage}>Already have an account? <Link href={'/'}>Login</Link></p>
      </div>
    </section>
  )
}

export default page
import SetUsernameForm from './components/SetUsernameForm'
import styles from "./page.module.css"
 
const page = async () => {

  return (
    <section className={styles.secContainer}>
        <SetUsernameForm/>
    </section>
  )
}

export default page
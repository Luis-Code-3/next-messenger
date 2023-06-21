import { getServerSession } from 'next-auth'
import SetUsernameForm from './components/SetUsernameForm'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {redirect} from "next/navigation";
import styles from "./page.module.css"
 
const page = async () => {

    const session = await getServerSession(authOptions);
    if(!session?.user.isNewUser) {
        redirect('/');
    }


  return (
    <section className={styles.secContainer}>
        <SetUsernameForm/>
    </section>
  )
}

export default page
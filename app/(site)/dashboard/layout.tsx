import Navbar from "@/app/components/navbar/Navbar"
import styles from "./layout.module.css"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
        <div className={styles.box}>
            <Navbar/>
            {children}
        </div>
  )
}

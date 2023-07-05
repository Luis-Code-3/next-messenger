"use client"

import styles from "./navbar.module.css"
import Link from "next/link"
import { FaUserAlt, FaCog, FaCommentDots, FaSignOutAlt, FaComments, FaMoon } from "react-icons/fa"
import { useState } from "react"
import { signOut } from "next-auth/react"
import clsx from "clsx"

const Navbar = () => {

    const [selected, setSelected] = useState('convo');

    const handleClick = (clicked: string) => {
        if(clicked === selected) return

        setSelected(clicked);
    }

  return (
    <nav className={styles.navContainer}>
        <div className={styles.logoBox}><FaComments className={styles.svgLogo}/></div>

        <div className={styles.linkContainer}>
            <Link onClick={() => handleClick('convo')} className={clsx(styles.linkBox, selected === 'convo' && styles.activeNav)} href={'/dashboard/conversations'}><FaCommentDots className={styles.svg}/></Link>
            <Link onClick={() => handleClick('users')} className={clsx(styles.linkBox, selected === 'users' && styles.activeNav)} href={'/dashboard/users'}><FaUserAlt className={styles.svg}/></Link>
            <Link onClick={() => handleClick('settings')} className={clsx(styles.linkBox, selected === 'settings' && styles.activeNav)} href={'/dashboard/settings'}><FaCog className={styles.svg}/></Link>
            <div onClick={() => signOut()} className={styles.linkBox}><FaSignOutAlt className={styles.svg}/></div>
        </div>

        <div className={styles.linkBox}><FaMoon className={styles.svg}/></div>
    </nav>
  )
}

export default Navbar
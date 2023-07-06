'use client'

import styles from "./conversationList.module.css"
import { User } from "@prisma/client"
import ConversationBox from "../convoBox/ConversationBox";
import { FullConversationType } from "@/app/types";

type ConversationListProps = {
    users: User[];
    convos: FullConversationType[];
    currentUserEmail: String;
}

const ConversationList = ({users, convos, currentUserEmail}: ConversationListProps) => {
    
  return (
    <div className={styles.convoNavContainer}>
        <h3 className={styles.messages}>Messages</h3>
        <div className={styles.convoList}>
            {
            convos.length > 0 ?
            
            convos.map((convo) => {
                return <ConversationBox key={convo.id} data={convo} currentUserEmail = {currentUserEmail}/>
            })

            : <p>NO Convos</p>
            }
        </div>
    </div>
  )
}

export default ConversationList
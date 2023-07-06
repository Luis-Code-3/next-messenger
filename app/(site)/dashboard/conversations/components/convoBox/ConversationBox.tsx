"use client"

import { Conversation, User } from "@prisma/client";
import styles from "./conversationBox.module.css"
import Image from "next/image";
import { FullConversationType } from "@/app/types";
import {format} from 'date-fns';
import { useSession } from "next-auth/react";

type ConversationBoxProps = {
    data: FullConversationType;
    currentUserEmail: String;
}

const ConversationBox = ({data, currentUserEmail}: ConversationBoxProps) => {

    const messages = data.messages;
    const lastMessage = messages[messages.length - 1];

    const lastMessageText = () => {
        if(lastMessage?.image) return "Sent an image"

        if(lastMessage?.text) return lastMessage?.text

        return 'Started a conversation'
    }

    const otherUserName = () => {
        const otherUser = data.members.filter((member) => currentUserEmail !== member.email);
        return otherUser
    }

    const otherUser = otherUserName();

    const conversationType = (isGroup: boolean) => {
        if(isGroup) {
            return (
                <>
                    <div className={styles.image}></div>
                    <div className={styles.nameAndMessage}>
                        <h3>{data.name}</h3>
                        <p>{lastMessageText()}</p>
                    </div>

                    <p className={styles.time}>{format(new Date(data.lastMessageAt), 'p')}</p>
                </>
            )
        }

        return (
            <>
                <div className={styles.image}></div>
                <div className={styles.nameAndMessage}>
                    <h3>{otherUser[0].name}</h3>
                    <p>{lastMessageText()}</p>
                </div>

                <p className={styles.time}>{format(new Date(data.lastMessageAt), 'p')}</p>
            </>
        ) 
    }

    const handleClick = () => {

    }
    
  return (
    <div onClick={() => handleClick()} className={styles.boxContainer}>
        {
            conversationType(data.isGroup)
        }
    </div>
  )
}

export default ConversationBox
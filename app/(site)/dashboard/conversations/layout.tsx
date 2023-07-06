import styles from "./page.module.css"
import ConversationList from "./components/convoList/ConversationList"
import getConversations from "@/app/actions/getConversations"
import getUsers from "@/app/actions/getUsers";
import getCurrentUser from "@/app/actions/getCurrentUser";

export default async function ConversationLayout({
  children,
}: {
  children: React.ReactNode
}) {

    const conversations = await getConversations();
    const users = await getUsers();
    const currentUser = await getCurrentUser();

  return (
        <div className={styles.conversationAllContainer}>
            <ConversationList
                convos = {conversations}
                users = {users}
                currentUserEmail = {currentUser?.email || ''}
            />
            {children}
        </div>
  )
}

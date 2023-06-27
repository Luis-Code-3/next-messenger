import { authOptions } from '../api/auth/[...nextauth]/route';
import prisma from '../lib/prismadb';
import { getServerSession } from 'next-auth';

const getCurrentUser = async () => {
    
    try {
        const session = await getServerSession(authOptions);
        if(!session?.user.email) {
            return null
        }

        const currentUser = await prisma.user.findUnique({
            where: {
                email: session.user.email
            }
        });

        if(!currentUser) {
            return null
        }

        return currentUser;
    } catch (error) {
        console.log(error);
        return null
    }
}

export default getCurrentUser;
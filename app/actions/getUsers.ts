import prisma from '../lib/prismadb';
import getCurrentUser from './getCurrentUser';

const getUsers = async () => {
    const currentUser = await getCurrentUser();

    if(!currentUser?.email) {
        return [];
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: "desc"
            },
            where: {
                NOT: {
                    email: currentUser.email
                }
            }
        });

        return users;
    } catch (error) {
        console.log(error);
        return []  
    }
}

export default getUsers;
import { User } from "../Models/User"

export const verifyUniqueUser = async (userName: string, email: string): Promise<boolean> => {
    return User.find().then((users) => {
        let isUnique = true
        users.forEach((user) => {
            if (user.email === email || user.userName === userName) {
                
                isUnique = false
            }
        })
        return isUnique
    })
}


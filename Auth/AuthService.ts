import jwt from 'jsonwebtoken'
import { type User, removePassword } from '../models/User'

export const generateToken = (user: typeof User) => {
  // create a jwt token that is valid for 7 days
  const token = jwt.sign({ sub: user }, process.env.JWT_SECRET ?? '', {
    expiresIn: '7d'
  })

  return {
    ...user,
    token
  }
}
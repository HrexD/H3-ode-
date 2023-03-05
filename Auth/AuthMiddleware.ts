import { expressjwt } from 'express-jwt'

export const jwt = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }
  return expressjwt({ secret, algorithms: ['HS256'] }).unless({
    path: [
      // public routes that don't require authentication
      '/auth/login',
      '/auth/register'
    ]
  })
}
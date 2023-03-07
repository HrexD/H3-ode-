import crypto from 'crypto'

export interface Password {
  salt: string
  password: string
}

const generateSalt = (rounds: number = 12) => {
  return crypto.randomBytes(Math.ceil(rounds / 2))
    .toString('hex')
    .slice(0, rounds)
}

const hasher = (password: string, salt: string): Password => {
  const hash = crypto.createHmac('sha512', salt)
  hash.update(password)
  return {
    salt,
    password: hash.digest('hex')
  }
}

export const hashPassword = (password: string): Password => {
  const salt = generateSalt()
  return hasher(password, salt)
}

export const comparePassword = (password: string, storedPassword: Password): boolean => {
  const hashedPassword = hasher(password, storedPassword.salt)
  return hashedPassword.password === storedPassword.password
}
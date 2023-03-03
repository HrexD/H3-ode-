import express from 'express'
import mongoose from 'mongoose'

mongoose.connect('mongodb://anon:marbleCake@localhost:27017/my_db')

const app = express()

app.listen(3000, () => {
    console.log('Server is running')
  })
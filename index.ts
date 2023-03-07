import express from 'express'
import mongoose from 'mongoose'
import { jwt } from './Auth/AuthMiddleware'
import errorHandler from "./Error/ErrorsMiddleware";
import usersRouter from "./Controller/UserController";
import authRouter from './Auth/AuthController'
import expressSession from "express-session"
import dotenv from 'dotenv';
import bodyParser from "body-parser";

mongoose.connect('mongodb://anon:marbleCake@localhost:27017/my_db')

dotenv.config();
const app = express()

app.use(express.json())
app.use(jwt())
app.use(errorHandler)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(expressSession({secret: "secret", resave: true, saveUninitialized: true}))

app.get('/', (req, res) => {
  res.send('Hello World');
})

app.use('/auth', authRouter);



app.use(usersRouter);

app.listen(3000, () => {
    console.log('Server is running on port 3000')
  })
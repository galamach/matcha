const express = require('express')
const bodyParser = require('body-parser')
const logger = require('morgan')
const cors = require('cors')

/* Variables d'environnement */
require('dotenv').config()

/* Application */
const app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/images', express.static ('public/images'));
/* Base de données & ORM */
const mongoose = require('mongoose')
const dbURL = process.env.MONGO_DB_URL
mongoose.connect(dbURL, function(err){
  if(err){
    console.log('Error connecting to: '+ dbURL)
  }
  else{
    console.log('Connected to: '+ dbURL)
  }
})

/* CORS */
app.use(cors())
app.options('*', cors())

/* Routeur */
app.get('/', function(req, res) {
  res.status(200)
  res.json({message: 'Matcha API'})
});

const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')
const chatRouter = require('./routes/chat')
const notificationRouter = require('./routes/notification')

app.use('/auth', authRouter)
app.use('/user', userRouter)
app.use('/chat', chatRouter)
app.use('/notification', notificationRouter)

app.use(function(req, res, next) {
  next(createError(404));
});

/* Gestion des erreurs */
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json('error');
});

module.exports = app;

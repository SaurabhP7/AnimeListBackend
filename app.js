const config=require('./utils/config')
const express=require('express')
require('express-async-errors')
const app=express()
const cors=require('cors')

const loginRouter=require('./controllers/login')
const blogsRouter=require('./controllers/blogs')
const usersRouter=require('./controllers/users')

const middleware=require('./utils/middleware')
const logger=require('./utils/logger')
const mongoose=require('mongoose')

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true ,useFindAndModify: false})
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use(middleware.tokenExtractor)
app.use('/api/login',loginRouter)
app.use('/api/blogs',blogsRouter)
app.use('/api/users',usersRouter)

if(process.env.NODE_ENV==='test'){
  const testRouter=require('./controllers/testing')
  app.use('/api/testing',testRouter)
}

app.use(middleware.unknownEndPoint)
app.use(middleware.errorHandler)

module.exports=app
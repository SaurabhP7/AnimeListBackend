const router=require('express').Router()
const Anime=require('../models/anime')
const User=require('../models/users')

router.post('/reset',async (request,response)=>{
  await Anime.deleteMany({})
  await User.deleteMany({})
  response.status(204).end()
})

module.exports= router
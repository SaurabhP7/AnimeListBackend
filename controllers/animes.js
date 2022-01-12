/* eslint-disable no-mixed-spaces-and-tabs */
const animeRouter=require('express').Router()
const jwt=require('jsonwebtoken')

const Anime=require('../models/anime')
const User=require('../models/users')

animeRouter.get('/', async (request, response) => {
  const animes=await Anime.find({}).populate('user',{username:1,name:1})
  response.json(animes)
})

animeRouter.get('/:id', async (request, response) => {

  const anime=await Anime.findById(request.params.id)
  if(anime)
    response.json(anime)
  else
    response.status(404).end()

})

animeRouter.post('/:id/comments', async (request,response) => {
  
  const anime = await Anime
    .findById(request.params.id)

  anime.comments = anime.comments.concat(request.body.comment)
  await anime.save()

  response.status(201).json(anime)
	
})

animeRouter.post('/',async (request, response) => {
  
  const anime = new Anime(request.body)

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  
  if (!request.token || !decodedToken.id) {
	  return response.status(401).json({ error: 'token missing or invalid' })
  }
  
  const user = await User.findById(decodedToken.id)
  
  if (!anime.url || !anime.title) {
	  return response.status(400).send({ error: 'title or url missing ' })
  }
  
  if (!anime.likes) {
	  anime.likes = 0
  }
  if(!anime.comment){
	  anime.comments=[]
  }
  
  anime.user = user
  const savedAnime = await anime.save()
  
  user.animes = user.animes.concat(savedAnime._id)
  await user.save()
  
  response.status(201).json(savedAnime)

})


animeRouter.put('/:id', async (request, response) => {
  const anime = request.body
  const updatedAnime = await Anime.findByIdAndUpdate(request.params.id, anime, { new: true })
  response.json(updatedAnime.toJSON())
})

animeRouter.delete('/:id', async(request,response)=>{

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!request.token || !decodedToken.id) {
	  return response.status(401).json({ error: 'token missing or invalid' })
  }
  
  const user = await User.findById(decodedToken.id)
  const anime = await Anime.findById(request.params.id)
  if (anime.user.toString() !== user.id.toString()) {
	  return response.status(401).json({ error: 'only the creator can delete animes' })
  }
  
  await anime.remove()
  user.animes = user.animes.filter(b => b.id.toString() !== request.params.id.toString())
  await user.save()
  response.status(204).end()
	
})

module.exports=animeRouter
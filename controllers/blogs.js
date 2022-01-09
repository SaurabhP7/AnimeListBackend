/* eslint-disable no-mixed-spaces-and-tabs */
const blogRouter=require('express').Router()
const jwt=require('jsonwebtoken')

const Blog=require('../models/blog')
const User=require('../models/users')

blogRouter.get('/', async (request, response) => {
  const blogs=await Blog.find({}).populate('user',{username:1,name:1})
  response.json(blogs)
})

blogRouter.get('/:id', async (request, response) => {

  const blog=await Blog.findById(request.params.id)
  if(blog)
    response.json(blog)
  else
    response.status(404).end()

})

blogRouter.post('/:id/comments', async (request,response) => {
  
  const comment= request.body.comment
  const blog=await Blog.findById(request.params.id) 
  blog.comments=blog.comments.concat(comment) 
  const savedBlog=await blog.save() 
  response.status(201).json(savedBlog)
	
})

blogRouter.post('/',async (request, response) => {
  
  const blog = new Blog(request.body)

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  
  if (!request.token || !decodedToken.id) {
	  return response.status(401).json({ error: 'token missing or invalid' })
  }
  
  const user = await User.findById(decodedToken.id)
  
  if (!blog.url || !blog.title) {
	  return response.status(400).send({ error: 'title or url missing ' })
  }
  
  if (!blog.likes) {
	  blog.likes = 0
  }
  if(!blog.comment){
	  blog.comments=[]
  }
  
  blog.user = user
  const savedBlog = await blog.save()
  
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  
  response.status(201).json(savedBlog)

})


blogRouter.put('/:id', async (request, response) => {
  const blog = request.body
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog.toJSON())
})

blogRouter.delete('/:id', async(request,response)=>{

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!request.token || !decodedToken.id) {
	  return response.status(401).json({ error: 'token missing or invalid' })
  }
  
  const user = await User.findById(decodedToken.id)
  const blog = await Blog.findById(request.params.id)
  if (blog.user.toString() !== user.id.toString()) {
	  return response.status(401).json({ error: 'only the creator can delete blogs' })
  }
  
  await blog.remove()
  user.blogs = user.blogs.filter(b => b.id.toString() !== request.params.id.toString())
  await user.save()
  response.status(204).end()
	
})

module.exports=blogRouter
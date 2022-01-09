/* eslint-disable no-mixed-spaces-and-tabs */
const mongoose=require('mongoose')
const supertest=require('supertest')
const bcrypt=require('bcrypt')
const app=require('../app')
const api=supertest(app)

require('dotenv').config()

const listHelper=require('../utils/list_helper')
const helper=require('./test_helper')

const Blog=require('../models/blog')
const User = require('../models/users')

let token=null 

beforeEach(async ()=>{
  await Blog.deleteMany({})

  for(let blog of helper.initialblogs){
	 let blogObject=new Blog(blog)
	 await blogObject.save()
  }

  const response=await api.post('/api/login')
  .send({
		username:process.env.username,
		password:process.env.password
	})

  token=response.body.token
})

test('dummy returns one',()=>{
  const blogs=[]
  const result=listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  
  test('of empty list is zero',()=>{
    const result=listHelper.totalLikes([])
    expect(result).toBe(0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(helper.listWithOneBlog)
    expect(result).toBe(5)
  })

  test('of a bigger list is calculated right',()=>{
	  const result=listHelper.totalLikes(helper.initialblogs)
	  expect(result).toBe(36)
  })

})

describe('backend testing',()=>{

  test('correct amount of blog posts', async ()=>{

    let count=helper.initialblogs.length
		
    const response=await api.get('/api/blogs').set('Authorization',`Bearer ${token}`)
							
    expect(response.body).toHaveLength(count)

  })

  test('check for presence of id', async ()=>{
		
    const blogsAtStart=await helper.blogsInDb()
    const blog=blogsAtStart[0]
    const response=await api.get(`/api/blogs/${blog.id}`)
	  .set('Authorization',`Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toEqual({id:blog.id,...blog})

  })

  test('blog added successfully ', async()=>{

    const blogsAtStart=await helper.blogsInDb() 
    const newBlog={
      title: 'Full stack open',
      author: 'Prof Matti',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
    }

    await api.post('/api/blogs')
      .send(newBlog)
	  .set('Authorization',`Bearer ${token}`)
      .expect(201)
      .expect('Content-Type',/application\/json/)

    const blogsAtEnd=await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length+1)

  })

  test('blog is successfully deleted',async()=>{

    const blogsAtStart=await helper.blogsInDb()
    const blogToDelete=blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd=await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length-1)

    const titles=blogsAtEnd.map(blog=>blog.title)
    expect(titles).not.toContain(blogToDelete.title)
  })

  test('put blog is success' , async()=>{
		
    const blogsAtStart=await helper.blogsInDb() 
		
    const blogToUpdate=blogsAtStart[0] 
		
    const updatedBlog={
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 10,
    }


    await api.put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
	  .set('Authorization',`Bearer ${token}`)
      .expect(200)
      .expect('Content-Type',/application\/json/)


    const blogsAtEnd=await helper.blogsInDb()
		
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
		
    expect(blogsAtEnd[0].likes).not.toBe(blogsAtStart[0].likes)

  })
	
})

describe('test for user creation',()=>{

  beforeEach(async()=>{
    await User.deleteMany({})

    const passwordHash=await bcrypt.hash('secret',10)
    const user=new User({username:'root',passwordHash})

    await user.save()
  })

  test('creation succeeds with fresh username',async()=>{

    const usersAtStart=await helper.usersInDb()

    const newUser={
      username:'yourgoodfriendsp',
      name:'YourGoodFriendSP',
      password:'secret'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type',/application\/json/)

    const usersAtEnd=await helper.usersInDb()

    expect(usersAtEnd).toHaveLength(usersAtStart.length+1)

    const usernames=await usersAtEnd.map(u=>u.username)

    expect(usernames).toContain(newUser.username)
  })
	
  test('creation fails with proper statuscode and message if username already taken', async()=>{
    const usersAtStart=await helper.usersInDb()

    const newUser={
      username:'root',
      name:'Superuser',
      password:'secret'
    }

    const result=await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type',/application\/json/)
			
    expect(result.body.error).toContain('`username` to be unique')
		
    const usersAtEnd=await helper.usersInDb()

    expect(usersAtEnd).toHaveLength(usersAtStart.length)

  })


})

afterAll(()=>{
  mongoose.connection.close()
})


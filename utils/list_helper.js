/* eslint-disable no-mixed-spaces-and-tabs */
const dummy=()=>{
  return 1 
}

const totalLikes=(blogs)=>{
  let sum=blogs.reduce((sum,blog)=>sum+blog.likes,0) 
  return sum
}

const favouriteBlog=(blogs)=>{

  if(blogs.length===0){
	  return {}
  }

  let maxBlogLikes= blogs.reduce((max_blog, current_blog) =>
  	 (current_blog.likes > max_blog.likes) ? current_blog : max_blog
  ,blogs[0]) 

  return maxBlogLikes
	
}

module.exports={
  dummy,
  totalLikes,
  favouriteBlog
}
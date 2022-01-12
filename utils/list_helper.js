/* eslint-disable no-mixed-spaces-and-tabs */
const dummy=()=>{
  return 1 
}

const totalLikes=(animes)=>{
  let sum=animes.reduce((sum,anime)=>sum+anime.likes,0) 
  return sum
}

const favouriteAnime=(animes)=>{

  if(animes.length===0){
	  return {}
  }

  let maxAnimeLikes= animes.reduce((max_anime, current_anime) =>
  	 (current_anime.likes > max_anime.likes) ? current_anime : max_anime
  ,animes[0]) 

  return maxAnimeLikes
	
}

module.exports={
  dummy,
  totalLikes,
  favouriteAnime
}
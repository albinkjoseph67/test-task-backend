const Discussion = require('./Discussion')

// get a particular discussion
const getADis = (id)=>{
    return Discussion.findOne({
        id
    }).then((result)=>{
        if(result){
            return{
                statusCode:200,
                data:result
            }
        }else{
            return{
                statusCode:404,
                message:"No data is available"
            }
        }
    })
}

// update
const  updateDis = (id,title,description,photos)=>{
  return Discussion.findOne({
    id
  }).then((result)=>{
    if(result){
        result.id=id
        result.title=title
        result.description=description
        result.photos=photos
        result.save()
        return{
            statusCode:200,
                message:"Data Updated Successfully"
        }
    }else{
        return{
            statusCode:404,
            message:"No data is available"
        }
    }
  })
}




module.exports={
    getADis,updateDis
}
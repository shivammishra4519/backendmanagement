const { getDB } = require('../dbconnection');


const getAllState=async(req,res)=>{
    try{
        const db=getDB();
        const collection=db.collection('states');
        const result=await collection.find().toArray();
        if(!result){
            return res.status(400).json({message:'somtheing went wrong'});
        }
        res.status(200).json(result)

    } catch (error) {
        res.status(400).json(error)
    }
}


module.exports={getAllState}
const { getDB } = require("../dbconnection");

const saveMessage = async (req, res) => {
    try {
        const data = req.body;
        if(!data){
          return   res.status(400).json({message:'Invalid request'})
        }
        const db=getDB();
        const collection=db.collection('contactus');
        const result=await collection.insertOne(data);
        if(!result){
            return res.status(400).json({message:'somtheing went wrong'})
        }
        res.status(200).json({message:'success'})

    } catch (error) {
        res.status(400).json(error)
    }
}

module.exports={saveMessage}
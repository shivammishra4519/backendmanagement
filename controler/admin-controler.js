const { getDB } = require('../dbconnection');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const key = process.env.secretkey;
const tokenExpiry = '12h'; // Token expiry set to 12 hours

const login = async (req, res) => {
    try {
        const data = req.body;

        if (!data || !data.number || !data.password) {
            return res.status(400).json({ 'message': 'Bad request: userid and password required' });
        }

        const number = parseInt(data.number); // Convert number to string if necessary

        const db = getDB();
        const collection = db.collection('users');
        const user = await collection.findOne({ number: number });

        if (!user) {
            return res.status(400).json({ 'message': 'Invalid mobile number' });
        }
        if (!(user.password === data.password)) {
            return res.status(400).json({ 'message': 'incorret password' })
        }

        const status=user.active;
        
        if(!status){
            return res.status(400).json({message:'You are not avtive Contect to Your Admin'})
        }
        const payload = {
            number: number,
            role: user.role,
        };

        if (user.shopName) {
            payload.shop = user.shopName;
        }

        const token = jwt.sign(payload, key, { expiresIn: tokenExpiry });
        res.status(200).json({token});
    } catch (error) {
        return res.status(500).json({ 'message': 'Internal server error' });
    }
};


const veirfyToken=async(req,res)=>{
    try{
      
       
        const authHeader = req.headers['authorization'];
       
        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized: Authorization header missing' });
            
        }

        const token =  authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Token missing' });
        }

        jwt.verify(token, key, async (err, decodedToken) => {
            if ( err) {
                return res.status(400).json({ error: 'Unauthorized: Invalid token' });
            }
            res.status(200).json({message:'success'})
        });
    }catch (error) {
        return res.status(500).json({ 'message': 'Internal server error' });
    }
}


const fundTransferByadmin=async (req,res)=>{
    try{
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized: Authorization header missing' });
        }

        const token =  authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Token missing' });
        }

        jwt.verify(token, key, async (err, decodedToken) => {
            if ( err) {
                return res.status(400).json({ error: 'Unauthorized: Invalid token' });
            }
           
            const db=getDB();
            const collection=db.collection('transectiondetails');
            const query={
                type:'direct',
                senderId:decodedToken.number
            }
            const result=await collection.find(query).toArray();
            if(!result){
                return res.status(400).json({message:'Invalid request'});
            }
            res.status(200).json(result);
        });
    }catch (error) {
        return res.status(500).json({ 'message': 'Internal server error' });
    }
}

const fundReciveByadmin=async (req,res)=>{
    try{
        const authHeader = req.headers['authorization'];
        console.log('hh')
        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized: Authorization header missing' });
        }

        const token =  authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Token missing' });
        }

        jwt.verify(token, key, async (err, decodedToken) => {
            if ( err) {
                return res.status(400).json({ error: 'Unauthorized: Invalid token' });
            }
           
            const db=getDB();
            const collection=db.collection('transectiondetails');
            const query={
                receverId:decodedToken.number
            }
            const result=await collection.find(query).toArray();
            if(!result){
                return res.status(400).json({message:'Invalid request'});
            }
            res.status(200).json(result);
        });
    }catch (error) {
        return res.status(500).json({ 'message': 'Internal server error' });
    }
}
module.exports = { login,veirfyToken,fundTransferByadmin ,fundReciveByadmin};

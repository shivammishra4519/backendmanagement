const { getDB } = require('../dbconnection');


const isAccountPresent = async (req, res) => {
    try {
        const db = getDB();
        const collection = db.collection('users');
        const { number } = req.body;
        const result = await collection.findOne({ number: number });
        if (!result) {
            return res.status(400).json({ message: 'unautorized user' })
        }

        res.status(200).json({ message: 'success' })
    } catch (error) {
        return res.status(400).json(error); // Return any error as JSON
    }
}

const CreateNewPassword = async (req, res) => {
    try {
        const data = req.body;

        const filter = { number: data.number }; // Filter based on number
        const updateDoc = {
            $set: { password: data.password } // Set the new password
        };

        // Perform the update operation
        const db = await getDB();
        const collection = db.collection('users');
        const result = await collection.findOneAndUpdate(filter, updateDoc);
        if (!result) {
            return res.status(400).json({ message: 'somtheing went wrong' })
        }
        res.status(200).json({ message: 'password upadted' })


    } catch (error) {
        return res.status(400).json(error); // Return any error as JSON
    }
}
module.exports = { isAccountPresent,CreateNewPassword }
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
var ObjectId = require("mongodb").ObjectId;


dotenv.config();
const uri = process.env.MONGODB_URI;

let client;
async function connectClient() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
}

async function signup(req, res) {
    console.log(req.body);
    const { username, password, email } = req.body;
    try {
        await connectClient();
        const db = client.db("githubclone");
        const userCollections = db.collection("users");

        const user = await userCollections.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "User already exist" });
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUser = {
                username,
                password: hashedPassword,
                email,
                repositories: [],
                followedUsers: [],
                starRepos: [],
            }
            const result = await userCollections.insertOne(newUser);
            const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET_KEY, { expiresIn: "6h" });
            res.json({ token, userId: result.insertedId });
        }
    } catch (err) {
        console.error("Error during signup : ", err);
        res.status(500).json({ message: "Server error" });
    }
}

async function login (req, res){
    const { email, password } = req.body;
    try {
        await connectClient();
        const db = client.db("githubclone");
        const userCollections = db.collection("users");
        const user = await userCollections.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
        res.json({ token, userId: user._id });
    } catch (err) {
        console.error("Error during login : ", err);
        res.status(500).json({ message: "Server error" });
    }
}

async function getAllUsers (req, res){
    try {
        await connectClient();
        const db = client.db("githubclone");
        const userCollections = db.collection("users");
        const users = await userCollections.find({}).toArray();

        res.json(users);
    } catch (err) {
        console.error("Error during fetching : ", err);
        res.status(500).json({ message: "Server error" });
    }
}

async function getUserProfile(req, res) {
    const currId = req.params.id;
    try {
        await connectClient();
        const db = client.db("githubclone");
        const userCollections = db.collection("users");
        const user = await userCollections.findOne({
            _id: new ObjectId(currId),
        });
        
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        res.send(user);
    } catch (err) {
        console.error("Error during fetching : ", err);
        res.status(404).send("User not found");
    }
}

async function updateUserProfile(req, res) {
    const currId = req.params.id;
    const { email, password } = req.body;

    try {
        await connectClient();
        const db = client.db("githubclone");
        const userCollections = db.collection("users");

        let updateFields = { email };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateFields.password = hashedPassword;
        }
        
        const result = await userCollections.findOneAndUpdate(
            {_id: new ObjectId(currId)},
            { $set: updateFields },
            { returnDocument: "after" }
        );
        
        if (!result.value) {
            return res.status(404).json({ message: "User not found" });
        }

        res.send(result.value);
        
    } catch (err) {
        console.error("Error during updating : ", err);
        res.status(500).send("Server error");
    }
}

async function deleteUserProfile (req, res) {
    const currId = req.params.id;
    try {
        await connectClient();
        const db = client.db("githubclone");
        const userCollections = db.collection("users");

        const result = await userCollections.deleteOne({
            _id: new ObjectId(currId)
        })

        if (result.deleteCount == 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({message: "User deleted"})
        
    } catch (err) {
        console.error("Error during deleting : ", err);
        res.status(500).send("Server error");
    }
}

async function starRepo(req, res) {
    const { userId, repoId } = req.body;
    try {
        await connectClient();
        const db = client.db("githubclone");
        const userCollections = db.collection("users");
        const repoCollections = db.collection("repositories");

        const user = await userCollections.findOne({ _id: new ObjectId(userId) });

        const repo = await repoCollections.findOne({ _id: new ObjectId(repoId) });

        if (!user) {
            return res.status(404).json({ message: "User does not exist" });
        }

        if (!repo) {
            return res.status(404).json({ message: "Repository does not exist" });
        }

        if (user.starRepos.includes(repoId)) {
            await userCollections.updateOne(
                {
                    _id: new ObjectId(userId)
                },
                {
                    $pull: { starRepos: repoId }
                }
            )
            console.log(`${repoId} unstarred`);
            return res.status(200).json({
                message: "Respository unstarred successfully",
                starred: false
            });
        }

        await userCollections.updateOne(
            {
                _id: new ObjectId(userId)
            },
            {
                $addToSet: { starRepos: repoId }
            }
        )
        
        console.log(`${repoId} starred`);
        return res.status(200).json({
            message: "Respository starred successfully",
            starred: true
        });
    } catch (err) {
        console.error("Error starring repos", err);
    }
}

module.exports = {
    getAllUsers,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    login,
    signup,
    starRepo
}
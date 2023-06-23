const express = require('express');
const app = express();

app.use(express.json());

// z4U7qub4WTuzOnv1 - mongo password
const mongoose = require("mongoose");
// environment variable
require('dotenv').config()
mongoose.connect('mongodb+srv://sample-project:z4U7qub4WTuzOnv1@cluster0.wuagetf.mongodb.net/?retryWrites=true&w=majority');

const User = require('./models/User');
const Discussion = require('./models/Discussion');
const Logic = require('./models/Logic');

// password encryption using bcryptjs
const bcrypt = require('bcryptjs');
const bcryptSalt = bcrypt.genSaltSync(10)

// jsonwebtoken
const jwt = require('jsonwebtoken');
const jwtSecret = 'valkyrie';

// cookie-parser middleware
const cookieParser = require('cookie-parser');
app.use(cookieParser());


const cors = require('cors');
app.use(cors({
    credentials:true,
    origin:'http://127.0.0.1:5173',
}))

// for test
app.get('/test', (req,res) => {
    res.json('test ok');
})

app.listen(4001);

// register
app.post('/register', async (req,res) => {
    const {name,email,password} = req.body;
    
    try{
        const userDoc = await User.create({
            name,
            email,
            password:bcrypt.hashSync(password, bcryptSalt),
        });
        res.json(userDoc);
    }catch (e) {
        res.status(422).json(e);
    }
});

// login
app.post('/login', async (req,res) =>{
    const {email,password} = req.body;
    const userDoc = await User.findOne({email});
    if(userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password)
        if(passOk) {
            jwt.sign({email:userDoc.email, id:userDoc._id}, jwtSecret, {}, (err,token)=>{
                if (err) throw err;
                res.cookie('token',token).json(userDoc);

            } );
        }else{
            res.status(422).json('pass not ok');

        }
    }else {
        res.json('not found')
    }
});

// get profile name to header
app.get('/profile', (req,res) => {
    const {token} = req.cookies;

    if(token){
        jwt.verify(token, jwtSecret, {}, async (err, userData)=>{
           if(err) throw err;
           const {name,email,_id} = await User.findById(userData.id);
           res.json({name,email,_id});
        });
    }else{
        res.json(null);
    }
})

// logout
app.post('/logout', (req,res) =>{
    res.cookie('token', '').json(true)
});

// adding new discussion details 
app.post('/newDiscussion', (req,res) =>{
    const {token} = req.cookies;
    const {
        id,title,description,photoLink,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData)=>{
        if(err) throw err;
       const discussionDoc = await Discussion.create({
        owner:userData.id,
           id,title,description,photos:photoLink,
        });
        res.json(discussionDoc)
    });

});

// api call to get all discussions in the indexpage
app.get('/alldiscussions', async (req,res) => {
    res.json(await Discussion.find());
})

// api to display all places by that particular user
app.get('/discussions', (req,res) => {
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData)=>{
        const {id} = userData;
        res.json(await Discussion.find({owner:id}));
    });
});

// get a particular discussion through id
app.get('/get-discussion/:id', (req,res)=>{
    Logic.getADis(req.params.id)
    .then((result)=>{
        res.status(result.statusCode).json(result)
    })
})

// update
app.post('/update-discussion', (req,res)=>{
    Logic.updateDis(req.body.id,req.body.title,req.body.description,req.body.photoLink)
    .then((result)=>{
        res.status(result.statusCode).json(result)
    })
})
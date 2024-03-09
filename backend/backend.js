import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import mongoose, { SchemaTypes, mongo } from 'mongoose';
import jwt from 'jsonwebtoken';

const app=express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

const secret='secret';

mongoose.connect('mongodb+srv://zain:zain@cluster0.ny7ttaa.mongodb.net/zaymer')

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const todoSchema=new mongoose.Schema({
    title:String,
    description:String
});

const eventSchema= new mongoose.Schema({
    title:String,
    description:String
});

const foodSchema= new mongoose.Schema({
    title:String,
    time:String
});

const medsSchema= new mongoose.Schema({
    title:String,
    time:String
});

const locationSchema= new mongoose.Schema({
    latitude:String,
    longitude:String,
    time:String
});

const User=mongoose.model('User',userSchema);
const Todos=mongoose.model('Todos',todoSchema);
const Food=mongoose.model('Food',foodSchema);
const Events=mongoose.model('Event',eventSchema);
const Medicines=mongoose.model('Medicines',medsSchema);
const Location=mongoose.model('Location',locationSchema);

const authenticateJwt= (req,res,next)=>{
    const authHeader=req.headers.authorization;
    if(authHeader){
        const token = authHeader.split(" ")[1];
        jwt.verify(token,secret,(err,decoded)=>{
            if(err) return res.status(403)
            else {req.user=decoded;
                    next();}
        });
    } else res.status(401);
}

app.post("/signup", async(req,res)=>{
    const {username,password}=req.body;
    const user=await User.findOne({username});
    if(user) res.status(403).json({message:'User already exists'});
    else{
        const obj={username,password};
        const newUser= new User(obj);
        newUser.save();
        const token=jwt.sign({username},secret,{expiresIn:'3h'});
        res.json({message:'User Created Successfully',token})
    }

})

app.post("/signin", async(req,res)=>{
    const {username,password}= req.body;
    const user= await User.findOne({username,password});
    if(user){
        const token= jwt.sign({username},secret,{expiresIn:"3h"});
        console.log("hello")
        res.status(200).json({message:"Logged in successfully",token});
 }
    else res.status(403).json({message:"Invalid Username or Password"});
});

app.post("/location",authenticateJwt, async(req,res)=>{
    const location=new Location(req.body);
    await location.save();
    res.status(200).json({message:"Saved!"})
})

app.post("/food",authenticateJwt,async(req,res)=>{
    const food_item=new Food(req.body);
    await food_item.save();
    res.status(200).json({ message: 'Saved!' });
});


app.post("/pill",authenticateJwt,async (req,res)=>{
    const med=new Medicines(req.body);
    await med.save();
    res.status(200).json({ message: 'Saved!' });
});

app.post("/events",authenticateJwt,async(req,res)=>{
    const event=new Events(req.body);
    await event.save();
    res.status(200).json({ message: 'Saved!' });
});

app.post("/todo",authenticateJwt,async (req,res)=>{
    const todo=new Todos(req.body);
    await todo.save();
    res.status(200).json({ message: 'Saved!' });
});

app.delete("/removepill/:title",authenticateJwt, async(req,res)=>{
    const pillName=req.params.title;
    const pill= await Medicines.findOneAndDelete({title:pillName})
    if(pill){
        res.json({message:"Pill Deleted"});
    }
    else res.status(404).json({message:'Pill not found'});
})

app.get('/todos', authenticateJwt, async(req, res) => {
    const todos= await Todos.find({})
    res.json({todos});
  });

app.get('/eventlist', authenticateJwt,async (req, res) => {
    const events=await Events.find({})
    res.json({events});
  });

app.get('/meds', authenticateJwt,async(req,res)=>{
    const meds=await Medicines.find()
    res.json({meds});
});

app.get('/foodtracker', authenticateJwt,async (req,res)=>{
    const food=await Food.find({});
    res.json({food});
});

app.get("/getlocation",authenticateJwt, async(req,res)=>{
    const location=await Location.find({});
    res.json({location})
})

app.use((req, res, next) => {
    res.status(404).send();
  });

app.listen(3000);
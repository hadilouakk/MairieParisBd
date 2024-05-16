import express from "express"
import router from "./router.js"
import {connect} from "mongoose"
//const express =require("express");

connect("mongodb+srv://hadil:dbproject@cluster0.ab6i0l5.mongodb.net/Paris")
.then(function(){
    console.log("connexion mongo réussi")
})
.catch(function(err){
    console.log(new Error(err))
})

async function connexion(){
    await connect
}
connexion();

const app = express();
const PORT = 1235;

app.use(express.json()); 

app.use(router)

 app.listen(PORT, function(){
    console.log (`server express running on ${PORT}`)
 })
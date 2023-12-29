import path from "path";

import { v4 as uuid } from 'uuid';
const app = require('express')();
import express from "express";
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8080;
import {Socket} from "socket.io"
import {Request,Response} from "express";

var htmlPath = path.resolve("client");
app.use(express.static(htmlPath));



interface ISocketToUser
{
  
    room_id:string,
    user_name:string
    socket_id:string
}

interface IMessage{
  username:string
  message:string
}

interface ISocketToUserWithMessage extends ISocketToUser
{
  
    user_name:string
    socket_id:string,
    message:string
}

interface IUser{
  socketId:string,
  userName :string,
  score: number;
}

let words = [
  "banana",
  "elephant",
  "mountain",
  "keyboard",
  "ocean",
  "guitar",
  "fireworks",
  "sunset",
  "pizza",
  "robot",
  "umbrella",
  "moonlight",
  "volcano",
  "dragon",
  "car",
  "bicycle",
  "rainbow",
  "cactus",
  "whale",
  "mermaid"
];

let users:IUser[] = []
let messages: IMessage[] = [] 
let drawingPlayer = '';
let generaTedWord = ""

function clearTurn(){
  drawingPlayer = ""
  generaTedWord = ""
    messages.push({
      username: "JC BOT",
      message: `ended turn`,
    });

    io.emit("messages_load", messages)

    io.emit("clearCanvaServer")
    io.emit("ended_turn")
    io.emit("openChat")

}



io.on("connection",(socket:Socket)=>{


    // incrementa a pontuação do utilizador com o nome de utilizador especificado
  function addPoints(username: string, points: number) {
    const user = users.find((u) => u.userName === username);
    if (user) {
      user.score += points;
    }

    io.emit("pointsAdded", {
      users
    })

  }

  
  socket.on("load_messages", async function(socketInfo: ISocketToUser){
    
    io.emit("messages_load", messages) // emit load messages to only user

  })

  socket.on("message_sent", async function(socketInfo: ISocketToUserWithMessage){

  
    if(drawingPlayer !== "" && generaTedWord !== "") // game is running
    {
      if(generaTedWord.toLowerCase().trim().includes(socketInfo.message.toLowerCase().trim()) && socketInfo.message.length > 2)
      {
        
        const user = users.find((u) => u.userName === socketInfo.user_name);
        const drawer = users.find((u) => u.socketId === drawingPlayer);

        if(user && drawer)
        {
          //player
          addPoints(user.userName, socketInfo.message.length)
          //drawer
          addPoints(drawer.userName, socketInfo.message.length)

          messages.push({
            username: "JC BOT",
            message: `Nice ${user.userName}!🎉 - ${user.score} points`,
          });

          messages.push({
            username: "JC BOT",
            message: `Nice ${users.find(u=>u.socketId === drawingPlayer)?.userName && "Drawer"} - ${user.score} points`,
          });

          io.emit("message_received")

          
          io.to(socket.id).emit("closeChat")
          
          //bloquear o chat?
        }
      }
      else
      {
          //mandar msg palavra incorreta
          messages.push({
              username: "JC BOT",
              message: `WRONG 😢`,
          });

            io.emit("message_received")
      }

      return
    }

    if(socketInfo.message.toLowerCase().trim() === "reset"){
      messages = []
      let users2:IUser[] = []

      users.map((u)=>{
        users2.push({...u, score:0})
      })

      users = users2

      messages.push({
        username: "JC BOT",
        message: `GAME RESETED 😢`,
      });

      io.emit("message_received")
      io.emit("playerConnectedServer", users)
      clearTurn()

      return
    }

    messages.push({
      message:socketInfo.message,
      username:socketInfo.user_name
    })

    io.emit("message_received")

  })

  socket.on("fillColorCheckedChanged",()=>{
    socket.broadcast.emit("fillColorCheckedChanged")
  })

  socket.on("startDrawClient",(data)=>{
    io.emit("startDrawServer", data)
  })

  socket.on("drawingClient",(data)=>{
    io.emit("drawingServer",data)
  })

  socket.on("clearCanvaClient",()=>{

    socket.broadcast.emit("clearCanvaServer")
    socket.emit("clearCanvaServer")
  })

  socket.on("colorChanged",(color)=>{

    socket.broadcast.emit("colorChanged",color)

  })

  socket.on("changeToolClient",(btnId)=>{
    
    socket.broadcast.emit("changeToolServer", btnId)
    socket.emit("changeToolServer", btnId)
  })

  socket.on("mouseUpClient",()=>{

    io.emit("mouseUpServer")
  
  })


  socket.on("playerConnectedClient",(socketData:any)=>{


    if(drawingPlayer !== "") // when game has already started
    {

      io.to(socket.id).emit("cannotConnect")
      return;
    }

    if(socketData.userName  != "")
    {
      users.push({
        userName:socketData.userName,
        socketId:socket.id,
        score:0
      })
    }

    io.emit("playerConnectedServer", users)

    console.log("logged users:");
    console.log(users)

  })


  socket.on("start_game", ({ user_name }) => {

    // Only allow the first player who started the game to draw
    if (drawingPlayer === "") {
      console.log('game Started');
      drawingPlayer = socket.id;
      io.to(drawingPlayer).emit("closeChat")
      messages.push({
        username: "JC BOT",
        message: `${user_name} started the game. Guess the drawing!.`,
      });

      io.emit("messages_load", messages) // emit load messages to only user
    
      socket.broadcast.emit("game_started", { 
        userName:user_name,
        socketId:socket.id
      });

      const randomIndex = Math.floor(Math.random() * words.length);

      // select the string at the random index
      const randomWord = words[randomIndex];

      generaTedWord = randomWord

      io.to(drawingPlayer).emit("drawing_allowed",{
        word:randomWord
      });
    }
  });

  socket.on("end_turn",()=>{

    clearTurn()

    io.to(socket.id).emit("user_ended_turn")

  })


  socket.on("usernameCheck",()=>{
    io.to(socket.id).emit("usernameCheckServer",users)
  })
 
  socket.on("playerJoinedClient",(socketData:any)=>{

    if(socketData.userName  != "")
    {
      users.push({
        userName:socketData.userName,
        socketId:socket.id,
        score:0
      })
    }

    io.emit("playerJoinedServer", users)

  })


  socket.on("disconnect",(socketData)=>{
   
    let user = users.find(u => u.socketId == socket.id)
    
    if(user){
      user = {...user,score:0}
    }

    let users2:IUser[] = []

    users.map((u)=>{
      if(u.userName !== user?.userName)
        users2.push(u)
    })

    if(drawingPlayer === socket.id)
    {
      clearTurn()
    }

    users = users2

    console.log("users saida:");
    
    io.emit("playerDisconnectedServer",users)

    console.log(users)

  })

})

app.get('/', function(req:Request, res:Response) {

  return res.sendfile(path.resolve("client","index.html"));
  
});

server.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

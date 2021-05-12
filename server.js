const path = require("path");
const http = require("http");

const express = require("express");
const socketio = require("socket.io");
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser,userLeave,getRoomUsers} = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Setting static folder
app.use(express.static(path.join(__dirname,"public")))

const botName = 'Admin';


//RUn when client connects

io.on('connection', socket =>{

    socket.on('joinRoom',({username, room}) => {

        
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

    //Welcome current user
    socket.emit('message',formatMessage(botName,'Welcome To Chatbox'));

    //When user enters a chat room
    //Broadcast will show the prompt to all folks in chat room other than user itself
    socket.broadcast.to(user.room).emit('message',
    formatMessage(botName,`${user.username} has enetered the chat room`));

    //Send room and users info

    io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(user.room)
    });


    });
    

    socket.on('chatMessage', msg => {

        const user = getCurrentUser(socket.id);

        //console.log(msg);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });

    //When user disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user){

            //io.emit will show the prompt to all folks in chat room including the user itself
        io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
        
          // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    
    }
      

        
    });
});



const PORT = process.env.PORT||3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));  
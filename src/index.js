const express = require('express')
const http = require('http');
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const utils = require('./utils/messages')
const {addUser, removeUser, getUser, getUserInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server);

const port = process.env.PORT || 3000
const pubDir = path.join(__dirname, '../public');

app.use(express.static(pubDir));



io.on('connection',(socket) => {
    const welmsg = "Welcome to my Chat App"

    socket.on('join',(Obj,callback) => {
        const {error,user} = addUser({id: socket.id,username: Obj.username, room: Obj.room})

        if(error){
            return callback(error)
        }
        socket.join(user.room,)
        socket.emit('message',utils.generateMsg('Admin',welmsg))
        socket.broadcast.to(user.room).emit('message', utils.generateMsg('Admin',`${user.username} has join ${user.room} `))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })

        callback()
    })
    
    socket.on('sendMessage', (msg,callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        
        if(filter.isProfane(msg)){
            return callback('CB dont use bad words eh')
        }
        io.to(user.room).emit('message',utils.generateMsg(user.username,msg));

        callback();
    })
    
    socket.on('sendLocation',(lat,long,callback) =>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMsg', utils.generateLoc(user.username,`https://google.com/maps?q=${lat},${long}`))
        callback()
    })


    socket.on('disconnect', () => {
        const  user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', utils.generateMsg(`${user.username} has left the chat`))

            io.to(user.room).emit('roomData', {
                room:user.room,
                users: getUserInRoom(user.room)
            })
        }
        
    })

})


server.listen(port, () => {
    console.log(`Server is listening to port ${port}!`)
})
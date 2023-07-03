const mongoose = require('mongoose');
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgon = require('morgan');
const userRoute = require("./routes/users")
const authRoute = require("./routes/auth")
const postsRoute = require('./routes/posts')
const messageRoute = require('./routes/message')
const conversetionRoute = require('./routes/conv')
const commentRoute = require("./routes/comment");
const userDataRoute = require("./routes/userData");
const bookmarkRoute = require("./routes/bookMark");
const path = require("path");
const express = require('express')
const app = express()
const http = require('http').Server(app);
const port = process.env.PORT || 8000;
const cors = require('cors')

app.use(cors());
const io = require("socket.io")(http, {
  cors: {
    origin: ["*"]
  },
});


let users = [];
const addUser = (userId,socketId)=>{
 !users.some((user)=>user.userId===userId)
  && users.push({userId,socketId})
  
}
const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};
io.on("connection", (socket) => {
  console.log("a user connected.");
  
  //take user id and socketId from user and pass connected user to the client
  socket.on("addUser",(userId)=>{
      addUser(userId,socket.id)
      io.emit("getUsers",users)
      console.log(users);
  })

  //get and send message to the client
  socket.on("sendMessage", async({ senderId, receiverId, text,conversationId }) => {
      const user = await getUser(receiverId);
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
        conversationId,
      })
      console.log("sendMessage",user);
      console.log("arrat",users)
    });

    socket.on("sendNotification", async({ senderId, receiverId, type }) => {
      if(receiverId!=senderId){
        const receiver = await getUser(receiverId);
        console.log(receiver);
        io.to(receiver?.socketId).emit("getNotification", {
          senderId,
          type,
        });
        console.log(senderId, receiverId, type )
      }else{
        console.log("you can not send notification to yourself")
      }
    });


    socket.on("sendText", async({ senderId, receiverId, text }) => {
      const receiver = await getUser(receiverId);
      io.to(receiver?.socketId).emit("getText", {
        senderId,
        text,
      });
    });
  
  socket.on("disconnect",()=>{
      console.log("a user Disconnected...! ");
      removeUser(socket.id);
      io.emit("getUsers",users)
      console.log(users);
  })
});


dotenv.config();
mongoose.connect(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false

  }).then(() => {
    console.log(`connected to Mongodb`)
  }).catch((err) => {
    console.log(`connection Fail due to ${err}`)
  })

//middleware
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(helmet());
app.use(morgon("common"))
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/api/users", userRoute)
app.use("/api/auth", authRoute)
app.use("/api/posts", postsRoute)
app.use("/api/conv",conversetionRoute)
app.use("/api/message",messageRoute)
app.use("/api/comment",commentRoute)
app.use("/api/bookmark",bookmarkRoute)
app.use("/api/userData",userDataRoute)

http.listen(port, () => {
  console.log(`Backend Server is running on port ${port}`)
})


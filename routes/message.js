const router = require("express").Router()
const Message = require("../models/Message")

router.post("/", async(req,res)=>{
    const newMessage = new Message(req.body);
    try{
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    }catch(err){
        res.status(500).json(err)
    }
})

router.put("/:id",async(req,res)=>{
    try{
        await Message.findByIdAndUpdate(req.params.id,{
            read:true
        })
        res.status(200).json(" mark read" )
    }catch(err){
        res.status(500).json(err)
    }
})

//get 
router.get("/:conId" ,async (req,res)=>{
    try{
        const message = await Message.find({
            conversationId: req.params.conId,
        })
        res.status(200).json(message);
    }catch(err){
        res.status(500).json(err)
    }
})

router.get("/:id/notification", async(req,res)=>{
    try{
        const notificationCount = await Message.find({
            $and:[
                {receiver:req.params.id},
                {read:false}
            ]
        })
        res.status(200).json(notificationCount);
    }catch(err){
        res.status(500).json(err)
    }
})

router.get("/:id/unseen",async(req,res)=>{
    try{
        const messages = await Message.find({
            sender:req.params.id,
        })
        const unseenCount = messages.filter((m)=>m.read == false);
        res.status(200).json({message:unseenCount,count:unseenCount.length});
    }catch(err){
        res.status(500).json(err)
    }
})

module.exports = router;
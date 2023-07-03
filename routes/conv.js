const router = require("express").Router()
const Conversation = require("../models/Conversetion")

//create Conversetion
router.post("/:id", async (req,res)=>{
    const newCon = await new Conversation({members:[req.body.senderId, req.params.id]})
    try{
            const saveCon = await newCon.save()
            res.status(200).json(saveCon)
    }catch(err){
        res.status(500).json(err)
    }
})

router.get("/:userId" ,async (req ,res)=>{
    try{
        const conversation = await Conversation.find({members:{$in:[req.params.userId]}})
        res.status(200).json(conversation);
    }catch(err){
        res.status(500).json(err)
    }

})

// get conv includes two userId

router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
    try {
      const conversation = await Conversation.findOne({
        members: { $all: [req.params.firstUserId, req.params.secondUserId] },
      });
      res.status(200).json(conversation)
    } catch (err) {
      res.status(500).json(err);
    }
  });

module.exports=router;
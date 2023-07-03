const mongooose = require("mongoose")

const conversetionSchema = new mongooose.Schema({
    members:{
    type: Array,
    require:true,
    default:[],
    }
},{timestamps:true})

module.exports=mongooose.model("Conversetion",conversetionSchema)

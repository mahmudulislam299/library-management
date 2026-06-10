import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
    bookName:{
        type:String,
        required:true
    },
    alternateTitle:{
        type:String,
        default:""
    },
    author:{
        type:String,
        required:true
    },
    language:{
        type:String,
        default:""
    },
    publisher:{
        type:String,
        default:""
    },
    bookCountAvailable:{
        type:Number,
        required:true
    },
    bookStatus:{
        type:String,
        default:"Available"
    },

    
    shelfNumber: {
        type: String,
        default: ""   // or set: required: true
    },

    categories:[{ 
        type: mongoose.Types.ObjectId, 
        ref: "BookCategory" 
    }],
    
    transactions:[{
        type:mongoose.Types.ObjectId,
        ref:"BookTransaction"
    }]
},
{
    timestamps:true
})

export default mongoose.model("Book",BookSchema)

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    userType: {
        type: String,
        required: true, // fixed spelling
        enum: ["Student", "Employee"], 
    },
    userFullName: {
        type: String,
        required: true,
        trim: true,
    },
    memberId: {           
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 15,
        trim: true,
    },
    age: Number,
    gender: String,
    dob: String,
    department: String,   
    address: {
        type: String,
        default: "",
    },
    mobileNumber: {
        type: String,     
        required: true,
    },
    photo: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: 50,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    points: {
        type: Number,
        default: 0,
    },
    activeTransactions: [
        {
            type: mongoose.Types.ObjectId,
            ref: "BookTransaction",
        },
    ],
    prevTransactions: [
        {
            type: mongoose.Types.ObjectId,
            ref: "BookTransaction",
        },
    ],
    isAdmin: {
        type: Boolean,
        default: false,
    },
},
{
    timestamps: true,
});

export default mongoose.model("User", UserSchema);

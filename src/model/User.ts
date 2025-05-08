import mongoose, {Schema,Document} from "mongoose";


export interface Message extends Document{
    content : string;
    createdAt: Date;
    _id: string
}
export interface User extends Document{
    username: string;
    email: string;
    password: string;
    verifyCode:string;
    verifyCodeExpires: Date;
    isVerified: boolean;
    partyCode: string;
    saved: Message[]; // Assuming 'saved' should be of type Message[]
}




const MessageSchema: Schema<Message> = new Schema({
    content:{
        type: String,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
        required: true,
    },
    _id:{
        type: String,
        required: true
    }
})
const UserSchema: Schema<User> = new Schema({
    username:{
        type: String,
        required: [true,"Username is required"],
        trim: true,
        unique: true,
        
        
    },
    email:{
        type: String,
        required: [true,"Email is required"],
        match: [/.+@.+\..+/,"Please enter a valid email"],
        unique: true,
        
        
    },
    password:{
        type: String,
        required: [true,"Password is required"],
        minlength: [6,"Password must be at least 6 characters"],
    },
    verifyCode:{
        type: String,
        required: [true,"Verify Code is required"]
        
    },

    verifyCodeExpires:{
        type: Date,
        required: [true,"Verify Code Expiry is required"]
        
    },
    isVerified:{
        type: Boolean,
        default: false,
    },
    partyCode:{
        type: String,
        required: true
    },
    
    saved:[MessageSchema]
})


// export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

export const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema);


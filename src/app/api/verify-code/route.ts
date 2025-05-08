import dbConnect from "@/src/lib/dbConnect";
import {UserModel} from "@/src/model/User";

export async function POST(request: Request){
    await dbConnect()

    try {
        const {username,code} = await request.json()
        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({username: decodedUsername,})
        if(!user){
            return Response.json(
                { success: false,
                  message: "User not found." 
                 },
                
                { status: 500 });
        }
        const isValid = user.verifyCode == code
        const isCodeNotExpired =  new Date(user.verifyCodeExpires) > new Date()
        if(isValid && isCodeNotExpired){
            user.isVerified = true
            await user.save()
            return Response.json(
                { success: true,
                  message: "User Verified." 
                 },
                
                { status: 200 });
        }else if(!isCodeNotExpired){
            return Response.json(
                { success: false,
                  message: "Verification Code Expired. Please Sign up again tp get a new code" 
                 },
                
                { status: 400 });
        }else{
            return Response.json(
                { success: false,
                  message: "Incorrect Verification Code" 
                 },
                
                { status: 400 });
        }
    } catch (error) {
        console.error("Error verifying the user",error)
        return Response.json(
            { success: false,
              message: "An unexpected error occurred while verifying the user." 
             },
            
            { status: 500 });
    }
}
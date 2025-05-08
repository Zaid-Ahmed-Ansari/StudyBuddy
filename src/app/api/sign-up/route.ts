import dbConnect from "@/src/lib/dbConnect";
import {UserModel} from "@/src/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();

    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        {
          status: 400,
        }
      );
    }
    const existingUserByEmail = await UserModel.findOne({
      email,
      isVerified: true,
    });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    function generatePartyCode(length = 6) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return `STDY-${result}`;
    }
    const partyCode = generatePartyCode();
    
    if (existingUserByEmail) {
        if(existingUserByEmail.isVerified){
            return Response.json(
                {
                    success: false,
                    message: "Email already exists",
                },
                {
                    status: 400,
                }
            );
        }
        else{
          const hashedPassword = await bcrypt.hash(password, 10);
          existingUserByEmail.password = hashedPassword;
          existingUserByEmail.verifyCode = verifyCode;
          existingUserByEmail.verifyCodeExpires = new Date(Date.now() + 3600000); 
          if (!existingUserByEmail.partyCode) {
            existingUserByEmail.partyCode = partyCode;
          }
          await existingUserByEmail.save();
        }
    }

    else{
       const hashedPassword =  await bcrypt.hash(password, 10)
       const expiryDate = new Date()
         expiryDate.setHours(expiryDate.getHours() + 1)
         const newUser = new UserModel({
            username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpires: expiryDate,
                isVerified: false,
                partyCode: partyCode,
                
                saved : []
         })
            await newUser.save()
            
    }
    const emailResponse = await sendVerificationEmail(
        email,
        username,
        verifyCode,
    )
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message
        },
        { status: 500 }
      );
    }
    return Response.json({
      success: true,
      message: "User registered successfully, Please verify your email",
    }, { status: 201
    })
  } catch (error) {
    console.error("Error registering user:", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      { status: 500 }
    );
  }
}

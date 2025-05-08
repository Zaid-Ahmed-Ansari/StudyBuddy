import dbConnect from "@/src/lib/dbConnect";
import {UserModel} from "@/src/model/User";
import {z} from "zod";
import { usernameValidation } from "@/src/schemas/signUpSchema";


const usernameValidationSchema = z.object({
    username: usernameValidation,
})
export async function GET(request: Request){
    await dbConnect()
    try {
        const { searchParams} = new URL(request.url);
        const queryParam = {username: searchParams.get("username")}

        const result = usernameValidationSchema.safeParse(queryParam );

        if (!result.success) {
            const usernameError = result.error.format().username?.['_errors'] ?? []
                return Response.json(
                { success: false,
                  message: usernameError.length > 0 ? usernameError.join(", ") : "Invalid query parameter."
                 },
                
                { status: 400 });
        }

        const { username } = result.data
        const existingVerifiedUser = await UserModel.findOne({username, isVerified: true})

        if(existingVerifiedUser){
            return Response.json(
                { success: false,
                  message: "Username already exists." 
                 },
                
                { status: 400 });
        }
        return Response.json(
            { success: true,
              message: "Username is available." 
             },
            
            { status: 200 });


    } catch (error) {
        console.error("Error checking username uniqueness:", error);
        return Response.json(
            { success: false,
              message: "An unexpected error occurred while checking the username." 
             },
            
            { status: 500 });
    }
}
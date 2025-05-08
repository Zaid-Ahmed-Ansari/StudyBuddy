import { Message } from "../model/User";

export interface ApiResponse{
    success: boolean;
    message: string;
    
    messages?: Array<Message>
}
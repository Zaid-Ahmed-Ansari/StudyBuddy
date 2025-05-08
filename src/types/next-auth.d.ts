import 'next-auth'


declare module 'next-auth' {
    interface User{
        _id?:string;
        isVerified?:boolean;
        username?:string;
        partyCode?:string
    }

        interface Session{
        user:{
            _id?:string;
            isVerified?:boolean;
            username?:string;
            partyCode?:string
        }& DefaultSession["user"]
    } 
    }
    
declare module 'next-auth/jwt' {
    interface JWT{
        id?:string;
        isVerified?:boolean;
        username?:string;
        partyCode?:string
    }
}

import { Call } from "@stream-io/video-client"
import { useStreamVideoClient } from "@stream-io/video-react-sdk"
import { useEffect, useState } from "react"

export const useGetCallById = (callId: string|string[]) => {
    const [call, setcall] = useState<Call>()
    const [loading, setLoading] = useState(true)
    const client = useStreamVideoClient()
    useEffect(()=>{
        if(!client || !callId) return
        const loadCall = async ()=>{
            const {calls} = await client.queryCalls({
                filter_conditions:{
                    id:callId
                }
            })
            if(calls.length > 0) {
                setcall(calls[0])
            } else {
                setcall(undefined)
            }
            setLoading(false)
        }
        loadCall()
    },[client, callId])
    return {
        call,
        loading
    }
}
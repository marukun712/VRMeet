import dynamic from "next/dynamic";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function JoinRoom() {
    //error ReferenceError: RTCPeerConnection is not defined回避のためにDynamicComponentとしてimport
    let DynamicComponent = dynamic(() => import("./RoomComponent"), {
        ssr: false,
    });
    const supabase = createServerComponentClient({ cookies })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    return <DynamicComponent session={session} />
}
"use client"
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

export default function JoinRoom(): JSX.Element {
    //error ReferenceError: RTCPeerConnection is not defined回避のためにDynamicComponentとしてimport
    let DynamicComponent = dynamic(() => import("./RoomComponent"), {
        ssr: false,
    });

    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    if (id) return <DynamicComponent roomID={id} />

    return <>ルームIDを指定してください。</>
}
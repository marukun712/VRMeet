"use client"
import dynamic from "next/dynamic";

export default function Page() {
    //error ReferenceError: RTCPeerConnection is not defined回避のためにDynamicComponentとしてimport
    let DynamicComponent = dynamic(() => import("@/components/RoomComponent"), {
        ssr: false,
    });

    return <DynamicComponent />
}
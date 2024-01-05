"use client"
import dynamic from "next/dynamic";

export default function CreateRoom(): JSX.Element {
    //error ReferenceError: RTCPeerConnection is not defined回避のためにDynamicComponentとしてimport
    let DynamicComponent = dynamic(() => import("./RoomComponent"), {
        ssr: false,
    });

    return <DynamicComponent />
}
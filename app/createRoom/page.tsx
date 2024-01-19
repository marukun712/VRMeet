'use client'
import { useRouter } from "next/navigation"
import { v4 } from "uuid"

export default function CreateRoom() {
    const router = useRouter()
    router.push(`/room/${v4()}`) //新しいルームIDを生成
}
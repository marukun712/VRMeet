import { Results } from "@mediapipe/holistic"
import { VRM } from "@pixiv/three-vrm"
import { RoomMember } from "@skyway-sdk/room"

export type userAndVRMData = {
    "vrm": VRM,
    "user": RoomMember
}

export type motionData = {
    "user": string
    "motion": Results
}
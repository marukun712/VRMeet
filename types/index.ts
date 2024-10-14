import { Results } from "@mediapipe/holistic";
import { VRM } from "@pixiv/three-vrm";
import { RoomMember } from "@skyway-sdk/room";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

export type userAndVRMData = {
  vrm: VRM;
  user: RoomMember;
};

export type motionData = {
  user: string;
  motion: Results;
};

export type controlData = {
  control: TransformControls;
  id: string;
};

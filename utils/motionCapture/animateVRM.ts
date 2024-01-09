import * as Kalidokit from "kalidokit";
import { VRM } from '@pixiv/three-vrm'
import { rigRotation, rigFace, rigPosition } from './rig';
import { Results } from "@mediapipe/holistic";

/* VRM Character Animator */
export const animateVRM = (vrm: VRM, results: any, videoElement: HTMLVideoElement) => { //TODO 型エラーの解消
    if (!vrm) {
        return;
    }
    // Take the results from `Holistic` and animate character based on its Face, Pose, and Hand Keypoints.
    let riggedPose: Kalidokit.TPose | undefined, riggedLeftHand: any, riggedRightHand: any, riggedFace;

    const faceLandmarks = results.faceLandmarks;
    // Pose 3D Landmarks are with respect to Hip distance in meters
    const pose3DLandmarks = results.ea;
    // Pose 2D landmarks are with respect to videoWidth and videoHeight
    const pose2DLandmarks = results.poseLandmarks;

    // Be careful, hand landmarks may be reversed
    const leftHandLandmarks = results.rightHandLandmarks;
    const rightHandLandmarks = results.leftHandLandmarks;

    // Animate Face
    if (faceLandmarks) {
        riggedFace = Kalidokit.Face.solve(faceLandmarks, {
            runtime: "mediapipe",
            video: videoElement,
        });
        rigFace(riggedFace, vrm);
    }

    // Animate Pose
    if (pose2DLandmarks && pose3DLandmarks) {
        riggedPose = Kalidokit.Pose.solve(pose3DLandmarks, pose2DLandmarks, {
            runtime: "mediapipe",
            video: videoElement,
        });

        if (riggedPose == undefined) {
            return
        }

        rigRotation("Hips", riggedPose.Hips.rotation, 0.7, 0.3, vrm);
        rigPosition(
            "Hips",
            {
                x: riggedPose.Hips.position.x, // Reverse direction
                y: riggedPose.Hips.position.y + 1, // Add a bit of height
                z: -riggedPose.Hips.position.z, // Reverse direction
            },
            1,
            0.07
            , vrm
        );

        rigRotation("Chest", riggedPose.Spine, 0.25, 0.3, vrm);
        rigRotation("Spine", riggedPose.Spine, 0.45, 0.3, vrm);

        rigRotation("RightUpperArm", riggedPose.RightUpperArm, 1, 0.3, vrm);
        rigRotation("RightLowerArm", riggedPose.RightLowerArm, 1, 0.3, vrm);
        rigRotation("LeftUpperArm", riggedPose.LeftUpperArm, 1, 0.3, vrm);
        rigRotation("LeftLowerArm", riggedPose.LeftLowerArm, 1, 0.3, vrm);

        rigRotation("LeftUpperLeg", riggedPose.LeftUpperLeg, 1, 0.3, vrm);
        rigRotation("LeftLowerLeg", riggedPose.LeftLowerLeg, 1, 0.3, vrm);
        rigRotation("RightUpperLeg", riggedPose.RightUpperLeg, 1, 0.3, vrm);
        rigRotation("RightLowerLeg", riggedPose.RightLowerLeg, 1, 0.3, vrm);
    }

    // Animate Hands
    if (leftHandLandmarks && riggedPose !== undefined) {
        riggedLeftHand = Kalidokit.Hand.solve(leftHandLandmarks, "Left");
        rigRotation("LeftHand", {
            // Combine pose rotation Z and hand rotation X Y
            z: riggedPose.LeftHand.z,
            y: riggedLeftHand.LeftWrist.y,
            x: riggedLeftHand.LeftWrist.x,
        }, 1, 0.3, vrm);
        rigRotation("LeftRingProximal", riggedLeftHand.LeftRingProximal, 1, 0.3, vrm);
        rigRotation("LeftRingIntermediate", riggedLeftHand.LeftRingIntermediate, 1, 0.3, vrm);
        rigRotation("LeftRingDistal", riggedLeftHand.LeftRingDistal, 1, 0.3, vrm);
        rigRotation("LeftIndexProximal", riggedLeftHand.LeftIndexProximal, 1, 0.3, vrm);
        rigRotation("LeftIndexIntermediate", riggedLeftHand.LeftIndexIntermediate, 1, 0.3, vrm);
        rigRotation("LeftIndexDistal", riggedLeftHand.LeftIndexDistal, 1, 0.3, vrm);
        rigRotation("LeftMiddleProximal", riggedLeftHand.LeftMiddleProximal, 1, 0.3, vrm);
        rigRotation("LeftMiddleIntermediate", riggedLeftHand.LeftMiddleIntermediate, 1, 0.3, vrm);
        rigRotation("LeftMiddleDistal", riggedLeftHand.LeftMiddleDistal, 1, 0.3, vrm);
        rigRotation("LeftThumbProximal", riggedLeftHand.LeftThumbProximal, 1, 0.3, vrm);
        rigRotation("LeftThumbIntermediate", riggedLeftHand.LeftThumbIntermediate, 1, 0.3, vrm);
        rigRotation("LeftThumbDistal", riggedLeftHand.LeftThumbDistal, 1, 0.3, vrm);
        rigRotation("LeftLittleProximal", riggedLeftHand.LeftLittleProximal, 1, 0.3, vrm);
        rigRotation("LeftLittleIntermediate", riggedLeftHand.LeftLittleIntermediate, 1, 0.3, vrm);
        rigRotation("LeftLittleDistal", riggedLeftHand.LeftLittleDistal, 1, 0.3, vrm);
    }
    if (rightHandLandmarks && riggedPose !== undefined) {
        riggedRightHand = Kalidokit.Hand.solve(rightHandLandmarks, "Right");
        rigRotation("RightHand", {
            // Combine Z axis from pose hand and X/Y axis from hand wrist rotation
            z: riggedPose.RightHand.z,
            y: riggedRightHand.RightWrist.y,
            x: riggedRightHand.RightWrist.x,
        }, 1, 0.3, vrm);
        rigRotation("RightRingProximal", riggedRightHand.RightRingProximal, 1, 0.3, vrm);
        rigRotation("RightRingIntermediate", riggedRightHand.RightRingIntermediate, 1, 0.3, vrm);
        rigRotation("RightRingDistal", riggedRightHand.RightRingDistal, 1, 0.3, vrm);
        rigRotation("RightIndexProximal", riggedRightHand.RightIndexProximal, 1, 0.3, vrm);
        rigRotation("RightIndexIntermediate", riggedRightHand.RightIndexIntermediate, 1, 0.3, vrm);
        rigRotation("RightIndexDistal", riggedRightHand.RightIndexDistal, 1, 0.3, vrm);
        rigRotation("RightMiddleProximal", riggedRightHand.RightMiddleProximal, 1, 0.3, vrm);
        rigRotation("RightMiddleIntermediate", riggedRightHand.RightMiddleIntermediate, 1, 0.3, vrm);
        rigRotation("RightMiddleDistal", riggedRightHand.RightMiddleDistal, 1, 0.3, vrm);
        rigRotation("RightThumbProximal", riggedRightHand.RightThumbProximal, 1, 0.3, vrm);
        rigRotation("RightThumbIntermediate", riggedRightHand.RightThumbIntermediate, 1, 0.3, vrm);
        rigRotation("RightThumbDistal", riggedRightHand.RightThumbDistal, 1, 0.3, vrm);
        rigRotation("RightLittleProximal", riggedRightHand.RightLittleProximal, 1, 0.3, vrm);
        rigRotation("RightLittleIntermediate", riggedRightHand.RightLittleIntermediate, 1, 0.3, vrm);
        rigRotation("RightLittleDistal", riggedRightHand.RightLittleDistal, 1, 0.3, vrm);
    }
};

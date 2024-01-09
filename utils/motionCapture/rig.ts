import * as THREE from 'three'
import * as Kalidokit from "kalidokit";
import { VRM, VRMSchema } from '@pixiv/three-vrm'

//Import Helper Functions from Kalidokit
const clamp = Kalidokit.Utils.clamp;
const lerp = Kalidokit.Vector.lerp;

// Animate Rotation Helper function 
export const rigRotation = (name: string, rotation: any = { x: 0, y: 0, z: 0 }, dampener: number, lerpAmount: number, currentVrm: VRM) => { //TODO 型エラーの解消
    if (!currentVrm || currentVrm.humanoid == null) {
        return;
    }
    const Part = currentVrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName[name as keyof typeof VRMSchema.HumanoidBoneName]);
    if (!Part) {
        return;
    }

    let euler = new THREE.Euler(
        rotation.x * dampener,
        rotation.y * dampener,
        rotation.z * dampener,
        rotation.rotationOrder || "XYZ"
    );
    let quaternion = new THREE.Quaternion().setFromEuler(euler);
    Part.quaternion.slerp(quaternion, lerpAmount); // interpolate
};

// Animate Position Helper Function
export const rigPosition = (name: string, position = { x: 0, y: 0, z: 0 }, dampener: number = 1, lerpAmount: number = 0.3, currentVrm: VRM) => {
    if (!currentVrm || currentVrm.humanoid == null) {
        return;
    }
    const Part = currentVrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName[name as keyof typeof VRMSchema.HumanoidBoneName]);
    if (!Part) {
        return;
    }
    let vector = new THREE.Vector3(position.x * dampener, position.y * dampener, position.z * dampener);
    Part.position.lerp(vector, lerpAmount); // interpolate
};

// Animate Face Helper Function
let oldLookTarget = new THREE.Euler();
export const rigFace = (riggedFace: Kalidokit.TFace | undefined, currentVrm: VRM) => {
    if (!currentVrm || !riggedFace) {
        return;
    }
    rigRotation("Neck", riggedFace.head, 0.7, 0.3, currentVrm);

    // Blendshapes and Preset Name Schema
    const Blendshape: any = currentVrm.blendShapeProxy;
    const PresetName = VRMSchema.BlendShapePresetName;
    if (currentVrm.lookAt == undefined || currentVrm.lookAt.applyer == undefined) { return };

    // Simple example without winking. Interpolate based on old blendshape, then stabilize blink with `Kalidokit` helper function.
    // for VRM, 1 is closed, 0 is open.
    riggedFace.eye.l = lerp(clamp(1 - riggedFace.eye.l, 0, 1), Blendshape.getValue(PresetName.Blink), 0.5);
    riggedFace.eye.r = lerp(clamp(1 - riggedFace.eye.r, 0, 1), Blendshape.getValue(PresetName.Blink), 0.5);
    riggedFace.eye = Kalidokit.Face.stabilizeBlink(riggedFace.eye, riggedFace.head.y);
    Blendshape.setValue(PresetName.Blink, riggedFace.eye.l);

    // Interpolate and set mouth blendshapes
    Blendshape.setValue(PresetName.I, lerp(riggedFace.mouth.shape.I, Blendshape.getValue(PresetName.I), 0.5));
    Blendshape.setValue(PresetName.A, lerp(riggedFace.mouth.shape.A, Blendshape.getValue(PresetName.A), 0.5));
    Blendshape.setValue(PresetName.E, lerp(riggedFace.mouth.shape.E, Blendshape.getValue(PresetName.E), 0.5));
    Blendshape.setValue(PresetName.O, lerp(riggedFace.mouth.shape.O, Blendshape.getValue(PresetName.O), 0.5));
    Blendshape.setValue(PresetName.U, lerp(riggedFace.mouth.shape.U, Blendshape.getValue(PresetName.U), 0.5));

    //PUPILS
    //interpolate pupil and keep a copy of the value
    let lookTarget = new THREE.Euler(
        lerp(oldLookTarget.x, riggedFace.pupil.y, 0.4),
        lerp(oldLookTarget.y, riggedFace.pupil.x, 0.4),
        0,
        "XYZ"
    );
    oldLookTarget.copy(lookTarget);
    currentVrm.lookAt.applyer.lookAt(lookTarget);
};
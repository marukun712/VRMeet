import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRM, VRMUtils } from '@pixiv/three-vrm'

export function VRMLoader(path: string): Promise<VRM> {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
        loader.load(
            path,

            (gltf) => {
                VRMUtils.removeUnnecessaryJoints(gltf.scene); //パフォーマンス改善のために不必要なジョイントを削除

                VRM.from(gltf).then((vrm) => { //gltfからVRMインスタンスを生成
                    return resolve(vrm)
                });
            },

            (progress) => console.log("Loading model...", 100.0 * (progress.loaded / progress.total), "%"),

            (error) => alert("モデルの読み込みに失敗しました。モデルをアップロードしてから再度参加してください。")
        );
    });
}

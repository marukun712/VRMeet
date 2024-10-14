import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRM, VRMUtils } from "@pixiv/three-vrm";

export function VRMLoader(path: string): Promise<VRM> {
  const loader = new GLTFLoader();
  loader.crossOrigin = "anonymous";

  return new Promise((resolve, reject) => {
    loader.load(
      path,

      (gltf) => {
        if (!gltf.userData.gltfExtensions?.VRM) {
          //VRM-0.xのモデルかどうかチェックする
          reject(
            "モデルのバージョンに互換性がありません。VRM-0.xのモデルを使用してください。"
          );
        } else {
          VRMUtils.removeUnnecessaryJoints(gltf.scene); //パフォーマンス改善のために不必要なジョイントを削除

          VRM.from(gltf).then((vrm) => {
            //gltfからVRMインスタンスを生成
            return resolve(vrm);
          });
        }
      },

      (progress) =>
        console.log(
          "Loading model...",
          100.0 * (progress.loaded / progress.total),
          "%"
        ),

      (error) => {
        alert(
          "モデルのダウンロードに失敗しました。モデルが正常にアップロードされているか確認してください。"
        );
        reject(error);
      }
    );
  });
}

import { RefObject, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

export const useThreeJS = (canvasRef: RefObject<HTMLCanvasElement>) => {
  const [scene, setScene] = useState<THREE.Scene>();
  const [orbitCamera, setOrbitCamera] = useState<THREE.PerspectiveCamera>();
  const [control, setControl] = useState<OrbitControls>();
  const [domElement, setDomElement] = useState<HTMLCanvasElement>();

  //ThreeJS Sceneの作成
  useEffect(() => {
    (async () => {
      if (!canvasRef || !canvasRef.current) {
        return;
      }

      //Three.jsシーンのSetup
      // レンダラー
      if (canvasRef.current == null) {
        return;
      }
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      setDomElement(renderer.domElement);

      // カメラ
      const orbitCamera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      orbitCamera.position.set(0.0, 1.4, 7);
      setOrbitCamera(orbitCamera);

      // コントロール
      const orbitControls = new OrbitControls(orbitCamera, renderer.domElement);
      orbitControls.screenSpacePanning = true;
      orbitControls.target.set(0.0, 1.4, 0.0);
      orbitControls.update();
      setControl(orbitControls);

      // シーンを作成
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#5AFF19");
      setScene(scene);

      // ライト
      const light = new THREE.DirectionalLight(0xffffff);
      light.position.set(1.0, 1.0, 1.0).normalize();
      scene.add(light);

      //リサイズ処理
      const onResize = () => {
        // サイズを取得
        const width = window.innerWidth;
        const height = window.innerHeight;

        // レンダラーのサイズを調整する
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);

        // カメラのアスペクト比を正す
        orbitCamera.aspect = width / height;
        orbitCamera.updateProjectionMatrix();
      };

      // 初期化のために実行
      onResize();
      // リサイズイベント発生時に実行
      window.addEventListener("resize", onResize);

      //アニメーション
      function animate() {
        requestAnimationFrame(animate); //loop
        renderer.render(scene, orbitCamera);
      }
      animate();
    })();
  }, []);

  const createTransformControls = (obj: THREE.Object3D) => {
    if (
      orbitCamera == null ||
      domElement == null ||
      scene == null ||
      control == null
    ) {
      return;
    }

    //transformControlsの初期化
    const transformControls = new TransformControls(orbitCamera, domElement);
    transformControls.addEventListener(
      "mouseDown",
      function (e: THREE.Event) {
        /// OrbitControls無効化
        control.enablePan = false;
        control.enableRotate = false;
      }.bind(this)
    );
    transformControls.addEventListener(
      "mouseUp",
      function (e: THREE.Event) {
        /// OrbitControls有効化
        control.enablePan = true;
        control.enableRotate = true;
      }.bind(this)
    );

    transformControls.attach(obj);
    scene.add(transformControls);
    return transformControls;
  };

  return { scene, setScene, createTransformControls };
};

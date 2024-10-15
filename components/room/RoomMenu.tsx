import { RoomMember } from "@skyway-sdk/room";
import Modal from "../ui/Modal";
import { useRef } from "react";
import { useState } from "react";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogOut, Settings, Share2 } from "lucide-react";

type Props = {
  roomURL: string;
  roomID: string;
  scene: THREE.Scene;
  me: RoomMember;
};
export default function RoomMenu(props: Props): JSX.Element {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isShowMenu, setIsShowMenu] = useState(true);
  const [bgColor, setBGColor] = useState("");
  const router = useRouter();

  return (
    <div className="flex w-screen">
      <div
        className={isShowMenu ? "absolute top-5 left-5" : "hidden"}
        ref={menuRef}
      >
        <Modal id="shere">
          <h1 className="text-2xl font-bold">ルームを共有</h1>
          <h1 className="py-5">以下のリンクを共有...</h1>
          <h1>{props.roomURL}</h1>
          <h1 className="py-5">または 以下のルームIDを共有</h1>
          <h1>{props.roomID}</h1>
        </Modal>

        <Modal id="settings">
          <h1 className="text-2xl font-bold">ルーム設定</h1>
          <h1 className="py-3">背景色</h1>
          <button
            className="btn btn-success"
            onClick={() =>
              (props.scene.background = new THREE.Color("#5AFF19"))
            }
          >
            GB
          </button>
          <button
            className="btn bg-blue-500"
            onClick={() =>
              (props.scene.background = new THREE.Color("#0067C0"))
            }
          >
            BB
          </button>
          <button
            className="btn bg-red-500"
            onClick={() =>
              (props.scene.background = new THREE.Color("#FF0000"))
            }
          >
            RB
          </button>

          <h1 className="py-3">16進数カラーコードで背景色を設定</h1>
          <input
            type="text"
            placeholder="カラーコードを入力..."
            className="input input-bordered input-primary w-full max-w-xs"
            value={bgColor}
            onChange={(e) => setBGColor(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={() => (props.scene.background = new THREE.Color(bgColor))}
            disabled={!bgColor}
          >
            背景色を適用
          </button>
        </Modal>

        <button
          className="bg-blue-300 btn"
          onClick={() => {
            let modal: any = document.getElementById("shere");
            modal.showModal();
          }}
        >
          <Share2 />
          共有
        </button>

        <button
          className="bg-blue-300 btn"
          onClick={() => {
            let modal: any = document.getElementById("settings");
            modal.showModal();
          }}
        >
          <Settings />
          ルーム設定
        </button>

        <button
          className="bg-red-500 btn"
          onClick={() => {
            props.me.leave();
            router.push("/");
          }}
        >
          <LogOut />
          ルームを退出
        </button>
      </div>

      <label className="swap absolute top-5 right-5">
        <input type="checkbox" onChange={() => setIsShowMenu(!isShowMenu)} />

        <Eye className="swap-on" />

        <EyeOff className="swap-off" />
      </label>
    </div>
  );
}

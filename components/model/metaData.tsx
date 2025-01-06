import { useRef } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { VRMMeta } from "@pixiv/three-vrm";

type Props = {
  meta: VRMMeta;
};

export default function MetaData(props: Props): JSX.Element {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isShowMenu, setIsShowMenu] = useState(true);

  return (
    <div className="flex w-screen">
      <div
        className={
          isShowMenu ? "absolute top-5 left-5 w-1/3 h-1/2 bg-white" : "hidden"
        }
        ref={menuRef}
      >
        <div className="absolute top-7 left-8">
          <h1 className="text-black text-4xl font-bold">モデルプレビュー</h1>
          <h1 className="text-black text-2xl font-bold my-5">
            {props.meta.title}
          </h1>
          <h1 className="text-black">製作者:{props.meta.author}</h1>
          <h1 className="text-black my-5">バージョン:{props.meta.version}</h1>
          <h1 className="text-black">
            ライセンスタイプ:{props.meta.licenseName}
          </h1>
          <h1 className="text-black my-5">メタデータ詳細:</h1>
          <pre className="text-black overflow-scroll w-96 h-64">
            {JSON.stringify(props.meta, null, 2)}
          </pre>
        </div>
      </div>

      <label className="swap absolute top-5 right-5">
        <input type="checkbox" onChange={() => setIsShowMenu(!isShowMenu)} />

        <Eye className="swap-on" />

        <EyeOff className="swap-off" />
      </label>
    </div>
  );
}

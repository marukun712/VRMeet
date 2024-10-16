import { Check, Trash2 } from "lucide-react";

type Props = {
  id: string;
  url: string;
  name: string;
  image_url: string;
  changeMainModel: ({
    model_url,
  }: {
    model_url: string | null;
  }) => Promise<void>;
  removeModel: (id: string, name: string) => Promise<void>;
};

export default function ModelDetails(props: Props): JSX.Element {
  return (
    <div>
      <h2 className="text-2xl">{props.name}</h2>
      <img src={props.image_url} className="rounded-md w-1/2 h-1/2"></img>
      <button
        className="btn w-24 bg-green-500"
        onClick={() => {
          let model_url: string = props.url;
          props.changeMainModel({ model_url });
        }}
      >
        <Check />
        使う
      </button>
      <button
        className="btn w-24 bg-red-500"
        onClick={() => {
          let id: string = props.id;
          let name = props.name;
          props.removeModel(id, name);
        }}
      >
        <Trash2 />
        削除
      </button>
    </div>
  );
}

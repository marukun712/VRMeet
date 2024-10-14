type Props = {
  id: string;
  url: string;
  name: string;
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
      <button
        className="btn w-24 btn-primary"
        onClick={() => {
          let model_url: string = props.url;
          props.changeMainModel({ model_url });
        }}
      >
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
        削除
      </button>
    </div>
  );
}

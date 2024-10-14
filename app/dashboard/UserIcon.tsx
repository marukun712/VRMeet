type Props = {
  avatarURL: string;
};

export default function UserIcon(props: Props): JSX.Element {
  return (
    <div>
      <div className="avatar justify-center flex">
        <div className="w-24 rounded-full">
          <img src={props.avatarURL} width={500} height={500} />
        </div>
      </div>
    </div>
  );
}

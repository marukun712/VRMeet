import { Loader } from "lucide-react";

type Props = {
  message: string;
};

export default function LoadingModal(props: Props): JSX.Element {
  return (
    <div>
      <input type="checkbox" id="loading" className="modal-toggle" />
      <div className="modal modal-open modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            <p className="flex justify-center py-5">
              <Loader />
            </p>
            <p className="text-center">{props.message}</p>
          </h3>
        </div>
      </div>
    </div>
  );
}

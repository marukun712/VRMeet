import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  id: string;
};
export default function Modal(props: Props): JSX.Element {
  return (
    <div>
      <dialog id={props.id} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <div>{props.children}</div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}

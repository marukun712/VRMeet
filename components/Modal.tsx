import { ReactNode } from "react";

type Props = {
    children: ReactNode;
    id: string
};
export default function Modal(props: Props) {
    return (
        <div>
            <dialog id={props.id} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <div>{props.children}</div>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn btn-primary">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </div>
    )
}
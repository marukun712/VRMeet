export default function LoadingModal(): JSX.Element {
    return (
        <div>
            <input type="checkbox" id="loading" className="modal-toggle" />
            <div className="modal modal-open modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Loading...</h3>
                </div>
            </div>
        </div>
    )
}
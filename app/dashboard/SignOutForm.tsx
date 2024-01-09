export default function SignOutForm() {
    return (
        <div className="py-5">
            <form action="/auth/signout" method="post">
                <button className="btn" type="submit">
                    サインアウト
                </button>
            </form>
        </div>
    )
}
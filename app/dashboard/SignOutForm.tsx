export default function SignOutForm() {
    return (
        <div>
            <form action="/auth/signout" method="post">
                <button className="btn" type="submit">
                    サインアウト
                </button>
            </form>
        </div>
    )
}
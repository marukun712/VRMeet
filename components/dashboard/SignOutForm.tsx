import { LogOut } from "lucide-react";

export default function SignOutForm(): JSX.Element {
  return (
    <div className="py-5">
      <form action="/auth/signout" method="post">
        <button className="btn" type="submit">
          <LogOut />
          サインアウトする
        </button>
      </form>
    </div>
  );
}

import Header from "@/components/Header";
import Link from "next/link";

export default function SignupConfirmPage() {
  return (
    <>
      <Header id="" />
      <div className="flex items-center justify-center mt-10">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            メール確認のお願い
          </h2>
          <p className="text-gray-600 mb-4">
            ご登録いただいたメールアドレスに確認メールを送信しました。メール内のリンクをクリックして、アカウントの認証を完了してください。
          </p>
          <p className="text-gray-600 mb-6">
            メールが届かない場合は、迷惑メールフォルダをご確認ください。
          </p>
          <Link
            href="/login"
            className="block w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-center"
          >
            ログインページに戻る
          </Link>
        </div>
      </div>
    </>
  );
}

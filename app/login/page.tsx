import Header from "@/components/Header";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <>
      <Header id="" />
      <div className="flex items-center justify-center mt-10">
        <LoginForm />
      </div>
    </>
  );
}

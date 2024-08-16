import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <>
      <Sidebar />
      <div className="flex-grow bg-red-600">Home</div>
    </>
  );
}
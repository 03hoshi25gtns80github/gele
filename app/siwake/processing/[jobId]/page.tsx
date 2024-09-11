"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const ProcessingPage = () => {
  const router = useRouter();
  const { jobId } = useParams();

  useEffect(() => {
    const checkProcessingStatus = async () => {
      // 定期的に処理状況を確認するロジックをここに追加
      const response = await fetch(`/api/siwake-api?jobId=${jobId}`, {
        method: "GET",
      });
      const data = await response.json();

      if (data.status === "completed") {
        router.push(`/siwake/result`);
      }
    };

    // 定期的にcheckProcessingStatusを呼び出す
    const intervalId = setInterval(checkProcessingStatus, 5000);

    return () => clearInterval(intervalId);
  }, [jobId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">処理中...</h1>
        <p className="text-gray-600">しばらくお待ちください。</p>
      </div>
    </div>
  );
};

export default ProcessingPage;

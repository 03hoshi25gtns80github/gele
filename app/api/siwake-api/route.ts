import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";
import { videoProcessor } from "@/utils/videoProcessor";

const getProcessingStatus = async (jobId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('video_jobs')
    .select('status')
    .eq('id', jobId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.status;
};

export async function POST(req: NextRequest) {
  console.log("POST リクエストを受信しました");

  try {
    const body = await req.json();
    console.log("リクエストボディ:", body);

    const { jobId, userInputs } = body;

    console.log(`jobId: ${jobId}`);
    console.log("userInputs:", userInputs);

    if (!jobId || typeof jobId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jobId)) {
      console.error(`無効なjobId: ${jobId}`);
      return NextResponse.json({ error: "無効なjobIdフォーマット" }, { status: 400 });
    }

    // Start processing the video
    console.log("ビデオ処理を開始します...");
    await videoProcessor(jobId, userInputs);
    console.log(`jobId: ${jobId} の処理が開始されました`);
    return NextResponse.json({ message: "処理が開始されました" }, { status: 200 });
  } catch (error) {
    console.error("POST /api/siwake-api でエラーが発生しました:", error);
    return NextResponse.json({ error: "処理の開始に失敗しました", details: (error as Error).message }, { status: 500 });
  }
};

export async function GET(req: NextRequest) {
  console.log("GET リクエストを受信しました");

  const url = new URL(req.url);
  const jobId = url.searchParams.get('jobId');

  console.log("クエリパラメータ:", { jobId });
  console.log(`jobId: ${jobId}`);

  if (!jobId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jobId)) {
    console.error(`無効なjobId: ${jobId}`);
    return NextResponse.json({ error: "無効なjobIdフォーマット" }, { status: 400 });
  }

  // Get processing status
  try {
    console.log("処理状態を取得中...");
    const status = await getProcessingStatus(jobId);
    console.log(`jobId ${jobId} の処理状態: ${status}`);
    return NextResponse.json({ status }, { status: 200 });
  } catch (error) {
    console.error("GET /api/siwake-api でエラーが発生しました:", error);
    return NextResponse.json({ error: "処理状態の取得に失敗しました", details: (error as Error).message }, { status: 500 });
  }
};

export async function DELETE(req: NextRequest) {
  console.log("キャンセルリクエストを受信しました");

  try {
    const body = await req.json();
    const { jobId } = body;

    console.log("キャンセル対象のjobId:", jobId);

    if (!jobId) {
      return NextResponse.json({ error: "jobIdが必要です" }, { status: 400 });
    }

    const supabase = createClient();
    
    // 現在のジョブステータスを確認
    const { data: currentJob, error: jobError } = await supabase
      .from('video_jobs')
      .select('status')
      .eq('id', jobId)
      .single();

    if (jobError) {
      console.error("ジョブ状態の取得に失敗:", jobError);
      throw jobError;
    }

    // ステータスをキャンセルに更新
    const { error: updateError } = await supabase
      .from('video_jobs')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (updateError) {
      console.error("ステータス更新に失敗:", updateError);
      throw updateError;
    }

    console.log(`ジョブ ${jobId} のキャンセルに成功しました`);
    return NextResponse.json({ 
      message: "ジョブがキャンセルされました",
      previousStatus: currentJob.status 
    }, { status: 200 });

  } catch (error) {
    console.error("キャンセル処理でエラーが発生:", error);
    return NextResponse.json(
      { error: "キャンセルに失敗しました", details: (error as Error).message },
      { status: 500 }
    );
  }
}

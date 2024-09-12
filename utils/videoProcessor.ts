import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import { join } from "path";
import { writeFile, unlink, readFile } from "fs/promises";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const FileNameSchema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      dataset_name: z.string(),
    })
  ),
});

async function checkIfCancelled(jobId: string) {
  const supabase = createClient();
  const { data: jobStatus, error: statusError } = await supabase
    .from("video_jobs")
    .select("status")
    .eq("id", jobId)
    .single();

  if (statusError) {
    console.error("ジョブステータスの取得に失敗しました:", statusError);
    throw statusError;
  }

  if (jobStatus.status === "cancelled") {
    console.log(`ジョブID: ${jobId} はキャンセルされました`);
    throw new Error("ジョブがキャンセルされました");
  }
}

export async function videoProcessor(jobId: string, userInput: string[]) {
  const supabase = createClient();
  console.log(`ジョブID: ${jobId} の処理を開始します`);

  // Fetch job details
  const { data: job, error: jobError } = await supabase
    .from("video_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (jobError) {
    console.error("ジョブの取得に失敗しました:", jobError);
    throw jobError;
  }

  // 処理がキャンセルされているか確認
  await checkIfCancelled(jobId);

  // user_inputをvideo_jobsのtargetsに挿入
  const { error: updateError } = await supabase
    .from("video_jobs")
    .update({ targets: userInput })
    .eq("id", jobId);

  if (updateError) {
    console.error("ジョブの更新に失敗しました:", updateError);
    throw updateError;
  }

  console.log("ジョブの詳細を取得しました:", job);

  // Fetch video files
  const { data: files, error: filesError } = await supabase
    .from("video_files")
    .select("*")
    .eq("job_id", jobId);

  if (filesError) {
    console.error("ビデオファイルの取得に失敗しました:", filesError);
    throw filesError;
  }
  console.log("ビデオファイルを取得しました:", files);

  const transcriptions = [];

  for (const file of files) {
    console.log(`ファイルID: ${file.id} の処理を開始します`);

    // 処理がキャンセルされているか確認
    await checkIfCancelled(jobId);

    // Process each file
    const { original_path } = file;

    // Download the file from Supabase
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("siwake_storage")
      .download(original_path);

    if (downloadError) {
      console.error("ファイルのダウンロードに失敗しました:", downloadError);
      throw downloadError;
    }

    const buffer = await fileData.arrayBuffer();
    const tempInputPath = join(
      tmpdir(),
      `input-${file.id}.${original_path.split(".").pop()}`
    );
    await writeFile(tempInputPath, Buffer.from(buffer));

    // 処理がキャンセルされているか確認
    await checkIfCancelled(jobId);

    // Convert to MP4
    const processedPath = await convertToMp4(tempInputPath, file.id, jobId);
    console.log(`ファイルID: ${file.id} をMP4に変換しました: ${processedPath}`);

    // 処理がキャンセルされているか確認
    await checkIfCancelled(jobId);

    // Convert to MP3
    const mp3Path = await convertToMp3(tempInputPath, jobId);
    console.log(`ファイルID: ${file.id} をMP3に変換しました: ${mp3Path}`);

    // 処理がキャンセルされているか確認
    await checkIfCancelled(jobId);

    // Extract audio and transcribe
    const transcription = await transcribeAudio(mp3Path);
    console.log(
      `ファイルID: ${file.id} の文字起こしが完了しました: ${transcription}`
    );
    transcriptions.push({ id: file.id, text: transcription });

    // Update database with processed path
    await supabase
      .from("video_files")
      .update({ processed_path: processedPath })
      .eq("id", file.id);
    console.log(
      `ファイルID: ${file.id} のデータベースを更新しました: ${processedPath}`
    );

    // Clean up temporary files
    await unlink(tempInputPath);
  }

  // 処理がキャンセルされているか確認
  await checkIfCancelled(jobId);

  // Generate new file names after all transcriptions are done
  const newFileNames = await generateNewFileName(transcriptions, userInput);
  console.log("新しいファイル名を生成しました:", newFileNames);

  for (const { id, newFileName } of newFileNames) {
    const file = files.find((f) => f.id === id);
    if (!file) continue;

    // Update database with new file name and transcription
    await supabase
      .from("video_files")
      .update({
        processed_name: newFileName,
        transcription: transcriptions.find((t) => t.id === id)?.text,
      })
      .eq("id", id);
    console.log(`ファイルID: ${file.id} のデータベースを更新しました`);
  }

  // Update job status
  await supabase
    .from("video_jobs")
    .update({ status: "completed" })
    .eq("id", jobId);
  console.log(`ジョブID: ${jobId} のステータスを更新しました: completed`);
}

async function convertToMp4(
  inputPath: string,
  outputName: string,
  jobId: string
): Promise<string> {
  console.log(`ファイルをMP4に変換します: ${inputPath}`);
  const tempOutputPath = join(tmpdir(), `output-${outputName}.mp4`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(tempOutputPath)
      .outputFormat("mp4")
      .on("end", async () => {
        try {
          const outputBuffer = await readFile(tempOutputPath);
          const supabasePath = await uploadToSupabase(
            outputBuffer,
            "siwake_storage",
            `${outputName}.mp4`,
            jobId
          );
          await unlink(tempOutputPath);
          console.log(
            `MP4ファイルをSupabaseにアップロードしました: ${supabasePath}`
          );
          resolve(supabasePath);
        } catch (error) {
          console.error("MP4ファイルのアップロードに失敗しました:", error);
          reject(error);
        }
      })
      .on("error", (error) => {
        console.error("MP4変換中にエラーが発生しました:", error);
        reject(error);
      })
      .run();
  });
}

async function convertToMp3(inputPath: string, jobId: string): Promise<string> {
  console.log(`ファイルをMP3に変換します: ${inputPath}`);
  const tempOutputPath = join(tmpdir(), `output-${Date.now()}.mp3`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(tempOutputPath)
      .outputFormat("mp3")
      .on("end", async () => {
        try {
          const outputBuffer = await readFile(tempOutputPath);
          const supabasePath = await uploadToSupabase(
            outputBuffer,
            "siwake_storage",
            `${path.basename(inputPath, path.extname(inputPath))}.mp3`,
            jobId
          );
          await unlink(tempOutputPath);
          console.log(
            `MP3ファイルをSupabaseにアップロードしました: ${supabasePath}`
          );
          resolve(supabasePath);
        } catch (error) {
          console.error("MP3ファイルのアップロードに失敗しました:", error);
          reject(error);
        }
      })
      .on("error", (error) => {
        console.error("MP3変換中にエラーが発生しました:", error);
        reject(error);
      })
      .run();
  });
}

async function transcribeAudio(filePath: string): Promise<string> {
  console.log(`音声ファイルの文字起こしを開始します: ${filePath}`);
  const supabase = createClient();

  // Supabaseからファイルをダウンロード
  const { data, error } = await supabase.storage
    .from("siwake_storage")
    .download(filePath);

  if (error) {
    console.error("ファイルのダウンロードに失敗しました:", error);
    throw error;
  }

  // 一時ファイルとして保存
  const tempFilePath = join(tmpdir(), `temp-${Date.now()}.mp3`);
  await writeFile(tempFilePath, Buffer.from(await data.arrayBuffer()));

  try {
    // Whisper APIを使用して文字起こし
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
    });

    console.log(`音声ファイルの文字起こしが完了しました: ${filePath}`);
    return transcription.text;
  } finally {
    // 一時ファイルを削除
    await unlink(tempFilePath);
  }
}

interface ResultItem {
  id: string;
  dataset_name: string;
}

interface OpenAIResponse {
  results: ResultItem[];
}

async function generateNewFileName(
  transcriptions: { id: string; text: string }[],
  userInput: string[]
): Promise<{ id: string; newFileName: string }[]> {
  console.log("新しいファイル名を生成するためのプロンプトを作成します");
  const datasetStr = userInput.join(", ");
  const prompt = `
# テキスト中からデータセットに存在する名前のうち、どれを含むか推測してください。 テキストは音声を文字起こしして作成されたものであり、正確ではありません。
## 絶対にデータセットのいずれかと対応させてください。 元の音声では会話の中にデータセットのいずれかの名前を必ず含んでいます。
## データセット内のものと対応していない推測は認めません。あなたならできます。
## 推測に失敗してもいいので失敗を恐れず全てのテキストに対して推測してください。例えばローマ字の一致率が50%を超えていたら推測してください
## 部分一致や母音一致を重視してください。
## どうしても 該当無しならdataset_nameをerrorとしてください

# 段階的に考えて人の名前を抽出してください
１- テキストをローマ字に変換する
２- データセット内のローマ字をテキストのローマ字に対して走査させ、データセットのローマ字との部分一致や母音一致の一致率が高い箇所を調べる
３- データセットのどの名前を含むか推測し決定する 
４- 推測したデータセット内のローマ字の名前と元のテキストを対応させる

# データセット
${datasetStr}

# 推測するテキストとid（テキストはカンマ区切りになっています、各テキストに対し推測を行ってください）
${transcriptions.map((t) => `(${t.id},${t.text})`).join(", ")}
`;

  console.log("プロンプトをOpenAIに送信します");
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content: "日本語の音声をテキスト化したものに対するタスクを解く",
      },
      { role: "user", content: prompt },
    ],
    response_format: zodResponseFormat(FileNameSchema, "file_name"),
  });

  const rawContent = completion.choices[0].message.content;
  console.log("OpenAIからの生の結果:", rawContent);

  const results = rawContent
    ? (JSON.parse(rawContent) as OpenAIResponse)
    : null;

  if (!results || !Array.isArray(results.results)) {
    console.error("OpenAIからの結果が予期しない形式です:", results);
    return transcriptions.map((t) => ({ id: t.id, newFileName: "error" }));
  }

  return transcriptions.map((t) => {
    const match = results.results.find((r) => r.id === t.id);
    return {
      id: t.id,
      newFileName: match ? match.dataset_name : "error",
    };
  });
}

async function uploadToSupabase(
  buffer: Buffer,
  bucket: string,
  fileName: string,
  jobId: string
): Promise<string> {
  const supabase = createClient();
  console.log(`Supabaseにファイルをアップロードします: ${fileName}`);
  const uploadPath = `${jobId}/${fileName}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(uploadPath, buffer, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Supabaseへのアップロードに失敗しました:", error);
    throw error;
  }
  console.log("Supabaseへのアップロードが完了しました:", data);
  return data.path;
}

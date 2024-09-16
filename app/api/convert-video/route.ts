import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export async function POST(request: Request): Promise<Response> {
  const supabase = createClient();

  // リクエストからファイルを取得
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const uid = formData.get("uid") as string;

  if (!file || !uid) {
    return NextResponse.json(
      { error: "No file or uid provided" },
      { status: 400 }
    );
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileName = `${uid}-${randomString}`;

  if (fileExt === "mts") {
    try {
      const ffmpeg = new FFmpeg();
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      await ffmpeg.writeFile('input.mts', await fetchFile(file));

      await ffmpeg.exec(['-i', 'input.mts', 'output.mp4']);

      const data = await ffmpeg.readFile('output.mp4');

      // Supabaseにアップロード
      const { data: uploadData, error } = await supabase.storage
        .from("videos")
        .upload(`${fileName}.mp4`, data, {
          contentType: "video/mp4",
        });

      if (error) {
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
      } else {
        // クライアントに返すファイルパスを生成
        const filePath = uploadData.path;
        return NextResponse.json({ filePath });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("File handling error:", err);
        return NextResponse.json(
          { error: "File handling failed", details: err.message, stack: err.stack },
          { status: 500 }
        );
      } else {
        console.error("Unknown error:", err);
        return NextResponse.json(
          { error: "An unknown error occurred" },
          { status: 500 }
        );
      }
    }
  } else {
    return NextResponse.json(
      { error: "Unsupported file format" },
      { status: 400 }
    );
  }
}

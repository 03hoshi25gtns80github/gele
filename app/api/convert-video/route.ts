import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";
import { tmpdir } from "os";
import { join } from "path";
import { writeFile, unlink, readFile } from "fs/promises";

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

  const buffer = Buffer.from(await file.arrayBuffer());
  const readableStream = new Readable();
  readableStream.push(buffer);
  readableStream.push(null);

  const fileExt = file.name.split(".").pop()?.toLowerCase();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileName = `${uid}-${randomString}`;

  if (fileExt === "mts") {
    const tempInputPath = join(tmpdir(), `input-${Date.now()}.mts`);
    const tempOutputPath = join(tmpdir(), `output-${Date.now()}.mp4`);

    await writeFile(tempInputPath, buffer);

    return new Promise<Response>((resolve) => {
      ffmpeg(tempInputPath)
        .output(tempOutputPath)
        .outputFormat("mp4")
        .on("end", async () => {
          try {
            const outputBuffer = await readFile(tempOutputPath);

            // Supabaseにアップロード
            const { data, error } = await supabase.storage
              .from("videos")
              .upload(`${fileName}.mp4`, outputBuffer, {
                contentType: "video/mp4",
              });

            await unlink(tempInputPath);
            await unlink(tempOutputPath);

            if (error) {
              resolve(
                NextResponse.json({ error: "Upload failed" }, { status: 500 })
              );
            } else {
              // クライアントに返すファイルパスを生成
              const filePath = data.path;
              resolve(NextResponse.json({ filePath }));
            }
          } catch (err) {
            resolve(
              NextResponse.json(
                { error: "File handling failed" },
                { status: 500 }
              )
            );
          }
        })
        .on("error", (err, stdout, stderr) => {
          resolve(
            NextResponse.json({ error: "Conversion failed" }, { status: 500 })
          );
        })
        .run();
    });
  } else {
    return NextResponse.json(
      { error: "Unsupported file format" },
      { status: 400 }
    );
  }
}

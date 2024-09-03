"use client";
import React, { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Comment from "@/components/ui/Comment";
import { FaStickyNote, FaEdit } from "react-icons/fa";
import DeleteVideoButton from "@/components/ui/DeleteVideoButton";
import EditVideos from "@/components/ui/EditVideos";

interface Videos {
  id: string;
  title: string;
  memo: string;
  video_url: string;
}

interface VideoListProps {
  videos: Videos[];
  user_id?: string;
}

const VideoList = ({ videos, user_id }: VideoListProps) => {
  const supabase = createClient();
  const [videoUrls, setVideoUrls] = React.useState<string[]>([]);
  const [editIndex, setEditIndex] = React.useState<number | null>(null);
  const [editedTitle, setEditedTitle] = React.useState<string>("");
  const [editedMemo, setEditedMemo] = React.useState<string>("");

  useEffect(() => {
    async function createVideoUrls(videos: Videos[]) {
      try {
        const urls: string[] = await Promise.all(
          videos.map(async (video) => {
            const { data } = await supabase.storage
              .from("videos")
              .getPublicUrl(video.video_url);
            if (!data || !data.publicUrl) {
              throw new Error("Error getting public URL");
            }
            return data.publicUrl;
          })
        );
        setVideoUrls(urls);
      } catch (error) {
        console.log("Error creating video URLs: ", error);
      }
    }

    if (videos.length > 0) createVideoUrls(videos);
  }, [videos, supabase]);

  const handleEdit = (index: number, title: string, memo: string) => {
    setEditIndex(index);
    setEditedTitle(title);
    setEditedMemo(memo);
  };

  const handleSave = async (videoId: string, index: number) => {
    try {
      const { error } = await supabase
        .from("videos")
        .update({ title: editedTitle, memo: editedMemo })
        .eq("id", videoId);
      if (error) throw error;

      // Update the local state to reflect the changes immediately
      const updatedVideos = [...videos];
      updatedVideos[index] = { ...updatedVideos[index], title: editedTitle, memo: editedMemo };
      setEditIndex(null);
    } catch (error) {
      console.log("Error updating video: ", error);
    }
  };

  const handleClose = () => {
    setEditIndex(null);
  };

  return (
    <div className="w-4/5">
      {videos.map((video, index) => (
        <div
          key={index}
          className="bg-gradient-to-r from-blue-200 to-blue-100 p-4 mt-2 mb-4 rounded flex shadow-lg relative"
        >
          <div className="flex-1 w-2/3">
            <h2 className="text-2xl font-bold mb-2 ml-4">{video.title}</h2>
            <video src={videoUrls[index]} controls className="w-full mb-2" />
          </div>
          <div className="mt-10 ml-4 w-1/3">
            <div className="mb-4 bg-white p-2 rounded">
              <div className="flex items-center border-b-2 border-gray-400">
                <FaStickyNote className="ml-2 mb-2 text-gray-400 text-3xl" />
                <div className="text-xl font-bold ml-2">メモ</div>
              </div>
              <p className="mt-2">{video.memo}</p>
            </div>
            <Comment videoId={video.id} />
          </div>
          {user_id && (
            <div className="absolute top-4 right-6">
              <DeleteVideoButton videoId={video.id} userId={user_id} />
            </div>
          )}
          {user_id && (
            <div className="absolute top-3 right-14">
              <FaEdit
                className="ml-2 mb-2 text-gray-400 text-3xl cursor-pointer"
                onClick={() => handleEdit(index, video.title, video.memo)}
              />
            </div>
          )}
        </div>
      ))}
      {editIndex !== null && (
        <EditVideos
          title={editedTitle}
          memo={editedMemo}
          onSave={() => handleSave(videos[editIndex].id, editIndex)}
          onClose={handleClose}
          setEditedTitle={setEditedTitle}
          setEditedMemo={setEditedMemo}
        />
      )}
    </div>
  );
};

export default VideoList;
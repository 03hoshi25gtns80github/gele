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
    <div className="w-11/12 mb-24 md:w-4/5">
      {videos.map((video, index) => (
        <div
          key={index}
          className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 p-2 md:p-4 mt-2 mb-4 rounded md:flex shadow-lg relative"
        >
          <div className="md:flex-1 w-full md:w-2/3">
            <h2 className="text-xl md:text-2xl font-bold mb-2 md:ml-4 text-gray-800 dark:text-gray-200">
              {video.title}
            </h2>
            <video 
              src={videoUrls[index]} 
              controls 
              playsInline
              poster={`${videoUrls[index]}#t=0.1`}
              className="w-full mb-2" 
            />
          </div>
          <div className="md:mt-10 md:ml-4 w-full md:w-1/3">
            <div className="mb-2 md:mb-4 bg-white dark:bg-gray-800 p-2 rounded">
              <div className="flex items-center border-b-2 border-gray-400 dark:border-gray-500">
                <FaStickyNote className="md:ml-2 md:mb-2 text-gray-400 dark:text-gray-500 text-xl md:text-3xl" />
                <div className="md:text-xl font-bold md:ml-2 text-gray-800 dark:text-gray-200">メモ</div>
              </div>
              <p className="mt-2 text-gray-700 dark:text-gray-300">{video.memo}</p>
            </div>
            <Comment videoId={video.id} />
          </div>
          {user_id && (
            <div className="absolute top-3 right-4 md:top-4 md:right-6">
              <DeleteVideoButton videoId={video.id} userId={user_id} />
            </div>
          )}
          {user_id && (
            <div className="absolute top-2 md:top-3 right-12 md:right-14">
              <FaEdit
                className="ml-2 mb-2 text-gray-400 dark:text-gray-500 text-3xl cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
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
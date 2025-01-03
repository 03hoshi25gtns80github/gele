"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push("/my-calendar");
      } else {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router, supabase.auth]);

  if (isLoading) {
    return <div className="text-gray-800 dark:text-gray-200">Loading...</div>;
  }

  return (
    <>
      <Header id={null} />
      <div className="w-4/5 md:w-2/3 pb-20 bg-gradient-to-r from-blue-200 to-purple-300 dark:from-slate-900 dark:to-slate-700 min-h-screen flex flex-col items-center">
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-gray-800 dark:text-gray-200 mt-24 text-5xl md:text-6xl font-bold">gele-plus</h1>
          <p className="text-gray-800 dark:text-gray-200 text-xl md:text-3xl mt-6">
            毎日の滑りをカレンダーに記録
          </p>
          <Link href="/login" legacyBehavior>
            <a className="mt-16 inline-block bg-indigo-400 dark:bg-blue-600 text-gray-800 dark:text-white text-xl font-bold py-3 px-6 rounded-full hover:bg-indigo-500 dark:hover:bg-blue-700 transition duration-300">
              Log in or Sign up
            </a>
          </Link>
        </motion.div>
        <div className="flex flex-col items-center mt-40 space-y-20">
          <motion.div
            className="flex flex-col items-center text-center md:flex-row md:items-center md:text-center"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src="/images/calendar2.png"
              alt="FormCalendar"
              className="w-80 h-70 mx-auto rounded-full shadow-lg md:order-2"
            />
            <div className="md:mr-8 mt-8 md:mt-0">
              <h2 className="text-gray-800 dark:text-gray-200 text-3xl md:text-4xl font-bold">
                My Calendar
              </h2>
              <p className="text-gray-800 dark:text-gray-200 text-xl md:text-3xl">カレンダーでいつでも振り返り</p>
            </div>
          </motion.div>
          <motion.div
            className="flex flex-col items-center text-center md:flex-row md:items-center md:text-center"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src="/images/02.jpg"
              alt="My calendar"
              className="w-80 h-70 mx-auto rounded-full shadow-lg"
            />
            <div className="md:ml-8 mt-8 md:mt-0">
              <h2 className="text-gray-800 dark:text-gray-200 text-2xl md:text-4xl font-bold">
                video&memo&comment
              </h2>
              <p className="text-gray-800 dark:text-gray-200 text-xl md:text-3xl">動画とメモとコメントを記録</p>
            </div>
          </motion.div>
          <motion.div
            className="flex flex-col items-center text-center md:flex-row md:items-center md:text-center"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src="/images/ski-background.jpg"
              alt="Friend System"
              className="w-80 h-70 mx-auto rounded-full shadow-lg md:order-2"
            />
            <div className="md:mr-8 mt-8 md:mt-0">
              <h2 className="text-gray-800 dark:text-gray-200 text-2xl md:text-4xl font-bold">
                Friend System
              </h2>
              <p className="text-gray-800 dark:text-gray-200 text-xl md:text-3xl">
                フレンドの動画にコメント
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
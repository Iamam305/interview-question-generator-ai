"use client";
import Image from "next/image";
import { FormEvent, useState } from "react";

export default function Home() {
  const [questions, setQuestions] = useState<any[]>();
  const [resume, setResume] = useState<File>();
  const [jd, setJd] = useState<File>();
  const [loading, setLoading] = useState(false);
  console.log(jd, resume);
  console.log(questions);

  const create_questions = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (resume && jd) {
      const new_fd = new FormData();
      new_fd.append("resume", resume);
      new_fd.append("jd", jd);

      const response = await fetch(
        "http://localhost:3000/api/create-questions",
        {
          method: "POST",
          body: new_fd,
        }
      );
      const data = await response.json();
      console.log(data);

      setQuestions(data.response.new_questions);

      setJd(undefined);
      setResume(undefined);
      setLoading(false);
    }
  };
  return (
    <>
      {questions && (
        <>
          {/* FAQ */}
          <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
            {/* Title */}
            <div className="max-w-2xl mx-auto mb-10 lg:mb-14">
              <h2 className="text-2xl font-bold md:text-4xl md:leading-tight dark:text-white">
                Questions
              </h2>
            </div>
            {/* End Title */}
            <div className="max-w-2xl mx-auto divide-y divide-gray-200 dark:divide-gray-700">
              {questions?.map((question) => (
                <div className="py-8 first:pt-0 last:pb-0">
                  <div className="flex gap-x-5">
                    <svg
                      className="flex-shrink-0 mt-1 size-6 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx={12} cy={12} r={10} />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <path d="M12 17h.01" />
                    </svg>
                    <div>
                      <h3 className="md:text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {question?.question}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* End FAQ */}
        </>
      )}
      <>
        {/* Comment Form */}
        <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <h2 className="text-xl text-gray-800 font-bold sm:text-3xl dark:text-white">
                Create Interview Questions
              </h2>
            </div>
            {/* Card */}
            <div className="mt-5 p-4 relative z-10 bg-white border rounded-xl sm:mt-10 md:p-10 dark:bg-gray-800 dark:border-gray-700">
              <form onSubmit={(e) => create_questions(e)}>
                <div className="mb-4 sm:mb-8">
                  <label
                    htmlFor="hs-feedback-post-comment-name-1"
                    className="block mb-2 text-sm font-medium dark:text-white"
                  >
                    Candidate Resume
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    id="hs-feedback-post-comment-name-1"
                    className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                    onChange={(e) => setResume(e.target.files[0])}
                  />
                </div>
                <div className="mb-4 sm:mb-8">
                  <label
                    htmlFor="hs-feedback-post-comment-email-1"
                    className="block mb-2 text-sm font-medium dark:text-white"
                  >
                    Job Descriptions
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    id="hs-feedback-post-comment-email-1"
                    className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                    placeholder="Email address"
                    onChange={(e) => setJd(e.target.files[0])}
                  />
                </div>

                <div className="mt-6 grid">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                    disabled={loading || !(resume && jd)}
                  >
                    {loading ? "Creating" : "Create"}
                  </button>
                </div>
              </form>
            </div>
            {/* End Card */}
          </div>
        </div>
        {/* End Comment Form */}
      </>
    </>
  );
}

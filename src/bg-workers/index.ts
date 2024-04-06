import { connect_db } from "@/configs/db";
import { Resume } from "@/models/resume.model";
import { Agenda } from "@hokify/agenda";
import os from "os";
import fs, { PathOrFileDescriptor } from "fs";
import path from "path";
import { s3_client } from "@/configs/s3-config";
import { Readable } from "stream";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";
import { RunnableSequence } from "langchain/runnables";
import { PromptTemplate } from "langchain/prompts";
import { TogetherAI } from "@langchain/community/llms/togetherai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { ChatGroq } from "@langchain/groq";
import { Question } from "@/models/questions.model";
import mongoose from "mongoose";

// connect_db();
// export const agenda = new Agenda({
//   db: { address: process.env.MONGODB_URI!, collection: "agendaJobs" },
// });

// agenda.define("create-questions", async (job: any) => {
//   const { id } = job.attrs.data;
// });

// (async function () {
//   // IIFE to give access to async/await
//   await agenda.start();
// })();

export const generate_question = async (id: string) => {
  const resume_info = await Resume.findOne({ _id: id });

  const files_download = await Promise.all([
    download_file(resume_info.resume_file_key),
    download_file(resume_info.job_description_file_key),
  ]);

  console.log(files_download);

  const parser = StructuredOutputParser.fromZodSchema(
    z.array(
      z.object({
        question: z
          .string()
          .describe("question that can be asked in the interview"),
        // potential_answer: z
        //   .string()
        //   .describe("potential answer to the question"),
      })
    )
  );

  const chain = RunnableSequence.from([
    PromptTemplate.fromTemplate(
      `Based on the provided candidate's resume and job description, generate a set of relevant interview questions that would help assess the candidate's suitability for the role.Generate as many questions as you can.

      {format_instructions}

      ------------------

      Resume -
      {resume}
      
      ------------------
      Job Description -
      {jd}
      `
    ),
    new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      temperature: 0,
      modelName: "mixtral-8x7b-32768",
      maxTokens: 10000,
    }),
    parser,
  ]);
  const resume_content = await new PDFLoader(
    files_download[0] as string
  ).load();
  const jd_content = await new PDFLoader(files_download[1] as string, {
    splitPages: false,
  }).load();
  const response = await chain.invoke({
    format_instructions: parser.getFormatInstructions(),
    jd: jd_content[0].pageContent,
    resume: resume_content[0].pageContent,
  });
  const data =  response.map((res) => ({
    question:res.question,
    resume: new mongoose.Types.ObjectId(id),
  }));
  // console.log(data);
  
  const new_questions = await Question.insertMany( data );
  return {
    new_questions,
    // jd: jd_content[0].pageContent,
    // resume: resume_content[0].pageContent,
  };
};

const download_file = async (file_key: string) => {
  try {
    const temp_dir = os.tmpdir();
    const file_path = path.join(temp_dir, file_key);
    const file_stream = fs.createWriteStream(file_path);

    const data = await s3_client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: file_key,
      })
    );

    const readStream = new Readable();
    readStream.push(await data.Body?.transformToByteArray());
    readStream.push(null);

    await readStream
      .on("error", (err) => {
        console.error("Error downloading file:", err);
      })
      .pipe(file_stream)
      .on("close", () => {
        console.log(`File downloaded to ${file_path}`);
        // Do something with the downloaded file, e.g., process it or move it to another location
      });
    return file_path;
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};

import {  generate_question } from "@/bg-workers";
import { connect_db } from "@/configs/db";
import { s3_client } from "@/configs/s3-config";
import { Resume } from "@/models/resume.model";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

connect_db();

export const POST = async (req: NextRequest) => {
  try {
    const form_data = await req.formData();
    const resume = form_data.get("resume") as File;
    const jd = form_data.get("jd") as File;
    const jd_file_key = Date.now().toString() + jd.name;
    const resume_file_key = Date.now().toString() + resume.name;
    if (
      resume.size < 2097152 &&
      jd.size < 2097152 &&
      resume.type == "application/pdf" &&
      jd.type == "application/pdf"
    ) {
      // const Body = (await file.arrayBuffer()) ;
      // const resume_file =

      // send(
      //     new PutObjectCommand({
      //       Bucket: process.env.SE_BUCKET,
      //       Key: "/resume/"+resume.name,
      //       Body: await resume.arrayBuffer() as Buffer,
      //       ACL: "public-read",
      //     })
      //   );

      // const jd_file =
      const file_uploads = await Promise.all([
        await s3_client.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: jd_file_key,
            Body: (await jd.arrayBuffer()) as Buffer,
            ACL: "public-read",
          })
        ),
        await s3_client.putObject({
          Bucket: process.env.S3_BUCKET,
          Key: resume_file_key,
          Body: (await resume.arrayBuffer()) as Buffer,
          ACL: "public-read",
        }),
      ]);
      const new_resume = await new Resume({
        resume_file_key: resume_file_key,
        job_description_file_key: jd_file_key,
      }).save();
      const response = await generate_question(new_resume._id);
      // const queue = await agenda.now("create-questions", { id: new_resume._id });
      // console.log(queue);

      return NextResponse.json({ response });
    } else {
      return NextResponse.json(
        {
          msg:
            jd.type !== "application/pdf" || resume.type !== "application/pdf"
              ? "Wrong file type, upload valid pdf file"
              : jd.size < 2097152 || resume.size < 2097152
              ? "File is larger than 2mb"
              : "Something went wrong",
        },
        { status: 409 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ msg: "something went wrong" }, { status: 500 });
  }
};

import { S3, S3Client } from "@aws-sdk/client-s3";

export const s3_client = new S3({
  endpoint: process.env.S3_ENDPOINT!, 
  forcePathStyle: true, 
  region: "us-east-1", 
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!, 
    secretAccessKey: process.env.S3_SECRET_KEY!, 
  },
});

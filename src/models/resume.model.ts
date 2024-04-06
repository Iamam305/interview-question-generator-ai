import mongoose from "mongoose";

const resume_schema = new mongoose.Schema({
    resume_file_key :{
        type:String,
        required:true
    },
    job_description_file_key:{
        type:String,
        required:true
    },

},{
    timestamps:true
})

export const Resume = mongoose.models.Resume || mongoose.model("Resume",resume_schema)
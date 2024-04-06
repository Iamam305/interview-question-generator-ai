import mongoose from "mongoose";

const question_schema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    potential_answer: {
      type: String,
      // required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Question =
  mongoose.models.Question ||
   mongoose.model("Question", question_schema);

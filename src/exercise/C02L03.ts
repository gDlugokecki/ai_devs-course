import * as dotenv from "dotenv";

import { getTaskInput, getTaskToken, submitTaskAnswer } from "../api";

import OpenAI from "openai";

dotenv.config();

const chat = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const taskData = await getTaskToken("embedding");
const input = await getTaskInput(taskData.token);

console.log(input);

const response = await chat.embeddings.create({
  input: "Hawaiian pizza",
  model: "text-embedding-ada-002",
});

const submitResponse = await submitTaskAnswer(
  taskData.token,
  response.data[0].embedding
);

console.log(submitResponse);

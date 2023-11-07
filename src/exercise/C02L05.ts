import * as dotenv from "dotenv";

import { getTaskInput, getTaskToken, submitTaskAnswer } from "../api";

import OpenAI from "openai";

dotenv.config();

const chat = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const taskData = await getTaskToken("functions");
const input = await getTaskInput(taskData.token);

console.log(input);

const addUserTaskSchema = {
  name: "addUser",
  description: "add user to database",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "User name",
      },
      surname: { type: "string", description: "User surname" },
      year: { type: "integer", description: "User year of birth" },
    },
  },
};

console.log(taskData.token);

const submitResponse = await submitTaskAnswer(
  taskData.token,
  addUserTaskSchema
);

console.log(submitResponse);

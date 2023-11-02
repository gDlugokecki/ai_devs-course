import * as dotenv from "dotenv";

import { getTaskInput, getTaskToken, submitTaskAnswer } from "../api";

import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";

dotenv.config();

const taskData = await getTaskToken("inprompt");
const input = await getTaskInput<{ input: string[]; question: string }>(
  taskData.token
);

const regexp = new RegExp(/\b[A-Z][a-z]*\b/);

const chat = new ChatOpenAI();

const match = input.question.match(regexp);

if (match) {
  const name = match[0];
  const filtered = input.input.find((item) => item.includes(name));

  const { content } = await chat.call([
    new SystemMessage(
      `Answer very briefly using the context below and nothing more. context###${filtered}###`
    ),
    new HumanMessage(input.question),
  ]);

  const submitResponse = await submitTaskAnswer(taskData.token, content);

  console.log(submitResponse, "Repsonse");
}

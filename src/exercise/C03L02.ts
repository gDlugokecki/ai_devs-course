import * as dotenv from "dotenv";

import { getTaskInput, getTaskToken, submitTaskAnswer } from "../api";

import OpenAI from "openai";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";

dotenv.config();

const taskData = await getTaskToken("scraper");
const inputResponse = await getTaskInput<{ input: string; question: string }>(
  taskData.token
);

const chat = new ChatOpenAI();

const { content } = await chat.call([
  new SystemMessage(
    `Answer ultra-concise using article from context. context###${inputResponse.input}###`
  ),
  new HumanMessage(inputResponse.question),
]);

const submitResponse = await submitTaskAnswer(taskData.token, content);

console.log(submitResponse);

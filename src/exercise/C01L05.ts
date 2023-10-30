import * as dotenv from "dotenv";

import { getTaskInput, getTaskToken, submitTaskAnswer } from "../api";

import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage } from "langchain/schema";

dotenv.config();

const taskData = await getTaskToken("Liar");
const input = await getTaskInput(taskData.token);

console.log(input);
const url = `${process.env.API_URL}/task/${taskData.token}`;

const userPrompt = "What is the capital of Poland?";

const response = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: `question=${userPrompt}`,
});

const data = (await response.json()).answer;

const chat = new ChatOpenAI();

const { content } = await chat.call([new HumanMessage(userPrompt)]);

const guardPrompt = `Return YES or NO if {prompt} answers the question ${userPrompt}`;
const prompt = PromptTemplate.fromTemplate(guardPrompt);

const chain = new LLMChain({ llm: chat, prompt });

const { text } = await chain.call({
  prompt: data,
  response: content,
});

const submitResponse = await submitTaskAnswer(taskData.token, text);

console.log(submitResponse);

import * as dotenv from "dotenv";
import { OpenAIModerationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { getTaskInput, getTaskToken, submitTaskAnswer } from "../api";
import { HumanMessage, SystemMessage } from "langchain/schema";
import OpenAI from "openai";
dotenv.config();

// PART1;
const moderation = new OpenAIModerationChain({
  openAIApiKey: process.env.OPENAI_API_KEY,
  throwError: false,
});
const taskDataP1 = await getTaskToken("moderation");
const responseP1 = await getTaskInput<{ input: string[] }>(taskDataP1.token);

const flagged = await Promise.all(
  responseP1.input.map(async (sentance) => {
    const { output, results } = await moderation.call({
      input: sentance,
    });
    if (results[0].flagged) {
      return 1;
    }
    return 0;
  })
);

const submitResponse = await submitTaskAnswer(taskDataP1.token, flagged);

console.log(submitResponse);

//PART2
const chat = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const taskDataP2 = await getTaskToken("blogger");
const responseP2 = await getTaskInput<{ blog: string[] }>(taskDataP2.token);

const content = `As a culinary blogger, please write a post in Polish. Each element of the provided array ${JSON.stringify(
  responseP2.blog
)} should be a separate paragraph in the post that describes element with unique title. Return the result in JSON in given format {content: {title, paragraph}[]}`;

try {
  const completion = await chat.chat.completions.create({
    messages: [{ role: "user", content: content }],
    model: "gpt-3.5-turbo",
  });

  if (completion.choices[0].message.content) {
    const parsed = JSON.parse(completion.choices[0].message.content) as {
      content: {
        title: string;
        paragraph: string;
      }[];
    };
    const article = parsed.content.map((item) => item.title + item.paragraph);
    const submitResponse = await submitTaskAnswer(taskDataP2.token, article);
    console.log(submitResponse);
  }
} catch (err) {
  console.log(err);
}

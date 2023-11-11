import * as dotenv from "dotenv";

import { getTaskInput, getTaskToken, submitTaskAnswer } from "../api";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { parseFunctionCall } from "../todoist/helper";

dotenv.config();

const guessWhoSchema = {
  name: "guessWho",
  description: "Guess who the person is",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description:
          "Write briefly and ultra-concise the name and surname person described in text. If you don't know say \"I don't know.\"",
      },
      confident: {
        type: "boolean",
        description: "you know who it is = true",
      },
    },
    required: ["name", "confident"],
  },
};

const guessWho = (name: string, surname: string) => {
  return name + surname;
};

const tools: any = {
  guessWho,
};

const chat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
}).bind({
  functions: [guessWhoSchema],
});

let hasGuessed = false;
const hints = [] as string[];

while (!hasGuessed) {
  const taskData = await getTaskToken("whoami");
  const task = await getTaskInput<{ hint: string }>(taskData.token);

  hints.push(task.hint);

  const conversation = await chat.invoke([
    new SystemMessage(
      `Guess who is described person using the following hints.`
    ),
    new HumanMessage(hints.join()),
  ]);
  const action = parseFunctionCall(conversation);
  if (action?.name && tools[action.name]) {
    if (action.args.confident) {
      const submitResponse = await submitTaskAnswer(
        taskData.token,
        action.args.name
      );
      hasGuessed = true;
      console.log(submitResponse);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));
}

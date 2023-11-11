import * as dotenv from "dotenv";

import { getTaskInput, getTaskToken, submitTaskAnswer } from "../api";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { parseFunctionCall } from "../todoist/helper";

dotenv.config();

const notSureMessage = "I don't know.";

const guessWhoSchema = {
  name: "guessWho",
  description: "Guess who the person is",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: `Write briefly and ultra-concise the name and surname person described in text. If you don't know say ${notSureMessage}`,
      },
      confident: {
        type: "boolean",
        description: "you know who it is = true",
      },
    },
    required: ["name", "confident"],
  },
};

const chat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.1,
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
  if (action?.name) {
    if (action.args.confident && action.args.name !== notSureMessage) {
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

// //NO FUNCTION CALLING
// const chat = new ChatOpenAI({
//   openAIApiKey: process.env.OPENAI_API_KEY,
//   temperature: 0.1,
// });

// const getHint = async () => {
//   const taskData = await getTaskToken("whoami");
//   const task = await getTaskInput<{ hint: string }>(taskData.token);
//   return task.hint;
// };

// const taskData = await getTaskToken("whoami");
// const task = await getTaskInput<{ hint: string }>(taskData.token);

// const conversation = [
//   new SystemMessage(
//     `I will give you a hint and you will try to guess the person described. Important thing is if you are not 100% sure say "NO" and nothing else. If you're sure then you can return the name of the person.`
//   ),
// ];

// let name;

// const guessWho = async (hint: string) => {
//   conversation.push(new HumanMessage(hint));
//   const { content } = await chat.call(conversation);
//   if (content === "NO") {
//     const hint = await getHint();
//     await guessWho(hint);
//   } else {
//     name = content;
//   }
// };

// await guessWho(task.hint);

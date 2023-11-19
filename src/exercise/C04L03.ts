import * as dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import { getTaskInput, getTaskToken, submitTaskAnswer } from "../api";

const client = new OpenAI();

const taskData = await getTaskToken("gnome");
const input = await getTaskInput<{
  url: string;
}>(taskData.token);

console.log(input);

const response = await client.chat.completions.create({
  model: "gpt-4-vision-preview",

  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "If You notice hat in the image, return it's color in polish else return error",
        },
        {
          type: "image_url",
          image_url: {
            url: input.url,
          },
        },
      ],
    },
  ],
});

const submitResponse = await submitTaskAnswer(
  taskData.token,
  response.choices[0].message.content
);

console.log(submitResponse);

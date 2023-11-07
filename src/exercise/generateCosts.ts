import * as dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const model = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

for (let i = 0; i < 5; i++) {
  const response = await model.images.generate({
    prompt: "3D orc mesh",
    n: 1,
    size: "1024x1024",
  });

  console.log(response, "Response");
}

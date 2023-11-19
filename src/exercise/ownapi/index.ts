import fastify from "fastify";
import { ChatOpenAI } from "langchain/chat_models/openai";
import * as dotenv from "dotenv";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { getTaskToken, submitTaskAnswer } from "../../api/index.js";
dotenv.config();

const server = fastify();

const chat = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
});

server.post<{ Body: { question: string } }>("/ping", async (request, reply) => {
  const taskData = await getTaskToken("ownapi");
  //
  const conversation = await chat.invoke([
    new SystemMessage("Answer ultra-concise:"),
    new HumanMessage(request.body.question),
  ]);
  //

  console.log(conversation, "Conv");
  const submitPopulationResponse = await submitTaskAnswer(
    taskData.token,
    conversation.content
  );
  //
  reply.code(200).send({ ...submitPopulationResponse });
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

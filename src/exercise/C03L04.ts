import { getTaskInput, getTaskToken, submitTaskAnswer } from "../api";
import { qdrantClient } from "../qdrant";
import * as dotenv from "dotenv";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

dotenv.config();

const taskData = await getTaskToken("search");
const task = await getTaskInput<{ question: string }>(taskData.token);

export const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  maxConcurrency: 5,
});

const queryEmbedding = await embeddings.embedQuery(task.question);

const search = await qdrantClient.search("search_task", {
  vector: queryEmbedding,
  limit: 1,
  filter: {
    must: [
      {
        key: "source",
        match: {
          value: "search_task",
        },
      },
    ],
  },
});
if (search[0].payload) {
  const submitResponse = await submitTaskAnswer(
    taskData.token,
    search[0].payload.url
  );

  console.log(submitResponse, "TASK");
}

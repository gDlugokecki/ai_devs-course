import * as dotenv from "dotenv";

import { getTaskInput, getTaskToken, submitTaskAnswer } from "../api";
import fs from "fs";
import OpenAI from "openai";

dotenv.config();

const chat = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const taskData = await getTaskToken("whisper");
const input = await getTaskInput<{ msg: string }>(taskData.token);

const response = await fetch("https://zadania.aidevs.pl/data/mateusz.mp3", {
  method: "GET",
});

const writeStream = fs.createWriteStream("./src/exercise/audio.mp3");
if (response.ok && response.body) {
  const reader = await response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    writeStream.write(value);
  }
  writeStream.end();
  const audioFile = fs.createReadStream("./src/exercise/audio.mp3");

  const transcriptionResponse = await chat.audio.transcriptions.create({
    model: "whisper-1",
    file: audioFile,
  });

  const submitResponse = await submitTaskAnswer(
    taskData.token,
    transcriptionResponse.text
  );
  console.log(submitResponse);
}

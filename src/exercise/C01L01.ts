import * as dotenv from "dotenv";
import { getTaskInput, getTaskToken, submitTaskAnswer } from "../api";
import { promptUserForInput } from "../utils";
import OpenAi from "openai";

dotenv.config();

const taskName = await promptUserForInput("Enter taskName:\n");

const taskData = await getTaskToken(taskName);
const input = await getTaskInput(taskData.token);

console.log(input);

const answer = await promptUserForInput("Enter answer:\n");

const submitResponse = await submitTaskAnswer(taskData.token, answer);

console.log(submitResponse);

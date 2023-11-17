import { ChatOpenAI } from "langchain/chat_models/openai";
import { getTaskInput, getTaskToken, submitTaskAnswer } from "../api";
import * as dotenv from "dotenv";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { parseFunctionCall } from "../todoist/helper";
dotenv.config();

const addTaskToCalendarSchema = {
  name: "addTaskToCalendar",
  description: "Add task with date",
  parameters: {
    type: "object",
    properties: {
      desc: {
        type: "string",
        description: "task description",
      },
      date: {
        type: "string",
        description: "date of the event",
        format: "YYYY-MM-DD",
      },
    },
    required: ["desc", "date"],
  },
};

const addTaskSchema = {
  name: "addTask",
  description: "Add task",
  parameters: {
    type: "object",
    properties: {
      desc: {
        type: "string",
        description: "task description",
      },
    },
    required: ["desc"],
  },
};

const taskData = await getTaskToken("tools");
const input = await getTaskInput<{
  question: string;
}>(taskData.token);

const chat = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
}).bind({
  functions: [addTaskToCalendarSchema, addTaskSchema],
});

const conversation = await chat.invoke([
  new SystemMessage(
    `Answer ultra-concise. Knowing that today is ${new Date()}`
  ),
  new HumanMessage(input.question),
]);

const action = parseFunctionCall(conversation);

if (action) {
  switch (action.name) {
    case "addTaskToCalendar":
      const addTaskToCalendarResponse = await submitTaskAnswer(taskData.token, {
        tool: "Calendar",
        ...action.args,
      });
      console.log(addTaskToCalendarResponse, "Resp");
      break;
    case "addTask":
      const addTaskToResponse = await submitTaskAnswer(taskData.token, {
        tool: "ToDo",
        ...action.args,
      });
      console.log(addTaskToResponse, "Resp");
      break;
    default:
      throw new Error("Function not implemented");
  }
}

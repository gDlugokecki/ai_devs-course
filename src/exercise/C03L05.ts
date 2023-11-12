import { HumanMessage, SystemMessage } from "langchain/schema";
import { getTaskInput, getTaskToken, submitTaskAnswer } from "../api";
import * as dotenv from "dotenv";
import { ChatOpenAI } from "langchain/chat_models/openai";
import people from "../../people.json";

dotenv.config();

const taskData = await getTaskToken("people");
const task = await getTaskInput<{ question: string; data: string }>(
  taskData.token
);

const chat = new ChatOpenAI();

const { content } = await chat.call([
  new SystemMessage(
    `Zwróć obiekt JSON {"imie": '{imie}', nazwisko: "{nazwisko}"} z zadanego pytania gdzie oba są w formie mianownika. 
    Jeśli imię jest w formie zdrobnionej zwróć pełne imię w formie oficjalnej.`
  ),
  new HumanMessage(`${task.question}`),
]);

const entity = JSON.parse(content);

const personInfo = people.find(
  (item) => item.imie === entity.imie && item.nazwisko === entity.nazwisko
);

if (personInfo) {
  const { content: content1 } = await chat.call([
    new SystemMessage(
      `Na podstawie konekstu odpowiedz na zadane pytanie. Zwróć tylko to o co pytan użytkownik i nic więcej, żadnych zbędnych znaków, zbędnych dodatków, najlepiej jednym wyrazem.
        context###${JSON.stringify(personInfo)}###
      `
    ),
    new HumanMessage(task.question),
  ]);

  const submitResponse = await submitTaskAnswer(taskData.token, content1);

  console.log(submitResponse);
}

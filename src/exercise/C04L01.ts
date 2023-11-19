import { getTaskInput, getTaskToken, submitTaskAnswer } from "../api";
import * as dotenv from "dotenv";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { parseFunctionCall } from "../todoist/helper";
dotenv.config();

const getExchangeRateSchema = {
  name: "getExchangeRate",
  description: "Get Exchange currency for given currency",
  parameters: {
    type: "object",
    properties: {
      currencyCode: {
        type: "string",
        description: "The currency code to get the exchange rate for",
      },
    },
    required: ["currencyCode"],
  },
};

const getPopulationSchema = {
  name: "getPopulation",
  description: "Get population for given country",
  parameters: {
    type: "object",
    properties: {
      countryName: {
        type: "string",
        description: "English name of a country to get population for",
      },
    },
    required: ["countryName"],
  },
};

const getPopulation = async (name: string) => {
  const response = await fetch(`https://restcountries.com/v3.1/name/${name}`);
  if (!response.ok) {
    return null;
  }
  return (await response.json())[0].population as string;
};

const getCurrentCurrenctExchangeRate = async (currency: string) => {
  const response = await fetch(
    `http://api.nbp.pl/api/exchangerates/rates/a/${currency}`
  );
  if (!response.ok) {
    return null;
  }
  const json = (await response.json()) as {
    rates: { no: string; effectiveDate: string; mid: number }[];
  };

  return json.rates[0].mid;
};

const chat = new ChatOpenAI({
  modelName: "gpt-4",
}).bind({
  functions: [getExchangeRateSchema, getPopulationSchema],
});

const taskData = await getTaskToken("knowledge");
const input = await getTaskInput<{
  question: string;
}>(taskData.token);

const conversation = await chat.invoke([
  new SystemMessage("Answer ultra-concise:"),
  new HumanMessage(input.question),
]);

const action = parseFunctionCall(conversation);

if (action && action.name === "getPopulation") {
  const population = await getPopulation(action.args.countryName);

  const submitPopulationResponse = await submitTaskAnswer(
    taskData.token,
    population
  );

  console.log(submitPopulationResponse);
} else if (action && action.name === "getExchangeRate") {
  const exchangeRate = await getCurrentCurrenctExchangeRate(
    action.args.currencyCode
  );

  const submitExchangeRateResponse = await submitTaskAnswer(
    taskData.token,
    exchangeRate
  );
  console.log(submitExchangeRateResponse);
} else {
  const generalKnowledgeResponse = await submitTaskAnswer(
    taskData.token,
    conversation.content
  );
  console.log(generalKnowledgeResponse);
}

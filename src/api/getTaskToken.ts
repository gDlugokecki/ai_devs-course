import { TokenData } from "../types/token.type";

const getTaskToken = async (taskName: string) => {
  const url = `${process.env.API_URL}/token/${taskName}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      apikey: process.env.API_KEY,
    }),
  });

  if (!response.ok) {
    console.log(response, "getTaskToken Error");
    process.exit(1);
  }

  const taskTokenData = (await response.json()) as TokenData;

  if (taskTokenData.code !== 0) {
    console.log(taskTokenData.msg, "Token Error");
    process.exit(1);
  }

  return taskTokenData;
};

export default getTaskToken;

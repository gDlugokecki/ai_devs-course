import { Answer } from "../types/answer.type";

const submitTaskAnswer = async (token: string, answer: string) => {
  const url = `${process.env.API_URL}/answer/${token}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ answer }),
  });

  if (!response.ok) {
    console.log(response, "submitTask error");
    process.exit(1);
  }

  return (await response.json()) as Answer;
};

export default submitTaskAnswer;

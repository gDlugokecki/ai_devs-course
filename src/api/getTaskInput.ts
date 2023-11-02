type Response<T> = {
  code: 0 | 1;
  msg: string;
} & T;

const getTaskToken = async <T>(token: string) => {
  const url = `${process.env.API_URL}/task/${token}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.log(response, "Response Error");
    process.exit(1);
  }

  return (await response.json()) as Response<T>;
};

export default getTaskToken;

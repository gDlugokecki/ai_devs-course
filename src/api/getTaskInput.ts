type Response<T extends string, K> = {
  code: 0 | 1;
  msg: string;
} & {
  [key in T]: K;
};

const getTaskToken = async <T extends string, K>(token: string) => {
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

  return (await response.json()) as Response<T, K>;
};

export default getTaskToken;

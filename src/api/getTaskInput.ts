const getTaskToken = async (token: string) => {
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

  return await response.json();
};

export default getTaskToken;

import * as readline from "readline";

const promptUserForInput = (promptText: string): Promise<string> => {
  return new Promise<string>((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(promptText, (answer) => {
      resolve(answer);
      rl.close();
    });
  });
};

export default promptUserForInput;

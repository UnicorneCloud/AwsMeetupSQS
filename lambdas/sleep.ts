import { SQSHandler, SQSEvent } from "aws-lambda";

export const handler: SQSHandler = async (event: SQSEvent) => {
  await Promise.all(
    event.Records.map(async () => {
      console.log("Sleep");
      await new Promise((r) => setTimeout(r, 10000));
    })
  );
};

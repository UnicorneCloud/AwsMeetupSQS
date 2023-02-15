import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({});

export const handler = async () => {
  console.log("Populate queue");

  const promises = [];
  for (let i = 0; i < 200; i++) {
    promises.push(
      await sqsClient.send(
        new SendMessageCommand({
          MessageBody: `MESSAGE ${i}`,
          QueueUrl: process.env.queueUrl,
        })
      )
    );
  }
  await Promise.all(promises);
  console.log("Populate queue done");
};

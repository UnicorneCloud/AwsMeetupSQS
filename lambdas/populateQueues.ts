import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({});

export const eventHandler = async () => {
  const params = {
    MessageBody: "MESSAGE",
    QueueUrl: process.env.queueUrl,
  };

  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(sqsClient.send(new SendMessageCommand(params)));
  }
  await Promise.all(promises);
};

import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({});

export const handler = async () => {
  console.log("Populate queue with message group ids");

  const promises = [];
  for (let i = 0; i < 2000; i++) {
    promises.push(
      await sqsClient.send(
        new SendMessageCommand({
          MessageGroupId: `GROUP_${i % 3}`, // Could be GROUP_1, GROUP_2 or GROUP_3
          MessageBody: `MESSAGE ${i}`,
          QueueUrl: process.env.queueUrl,
        })
      )
    );
  }
  await Promise.all(promises);
  console.log("Populate queue with message group ids done", promises);
};

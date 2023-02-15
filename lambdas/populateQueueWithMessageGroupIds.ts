import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import {v4 as uuidv4} from 'uuid';

const sqsClient = new SQSClient({});

export const handler = async () => {
  console.log("Populate queue with message group ids");

  const promises = [];
  for (let i = 0; i < 200; i++) {
    promises.push(
      await sqsClient.send(
        new SendMessageCommand({
          MessageGroupId: `GROUP_${i % 3}`, // Could be GROUP_0, GROUP_1 or GROUP_2
          MessageBody: `MESSAGE ${i} - ${uuidv4()}`,
          QueueUrl: process.env.queueUrl,
        })
      )
    );
  }
  await Promise.all(promises);
  console.log("Populate queue with message group ids done");
};

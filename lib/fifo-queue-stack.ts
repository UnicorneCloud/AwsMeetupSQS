import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_lambda_nodejs as lambda,
  aws_sqs as sqs,
  Duration,
} from "aws-cdk-lib";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
export class FifoQueueStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const FifoQueueDLQ = new sqs.Queue(this, "FifoQueueDeadLetterQueue", {
      fifo: true,
    });

    const FifoQueueSQS = new sqs.Queue(this, "FifoQueueQueue", {
      visibilityTimeout: Duration.seconds(12),
      deadLetterQueue: {
        queue: FifoQueueDLQ,
        maxReceiveCount: 1,
      },
      fifo: true,
      contentBasedDeduplication: true,
    });

    const FifoQueueEventSource = new SqsEventSource(FifoQueueSQS, {
      batchSize: 1,
    });

    const sleepLambda = new lambda.NodejsFunction(this, "sleep", {
      timeout: Duration.seconds(2),
      entry: `./lambdas/sleep.ts`,
      reservedConcurrentExecutions: 10,
    });
    sleepLambda.addEventSource(FifoQueueEventSource);

    const populateQueueWithMessageGroupIdsLambda = new lambda.NodejsFunction(
      this,
      "populate-queue-with-message-group-ids",
      {
        timeout: Duration.seconds(600),
        entry: `./lambdas/populateQueueWithMessageGroupIds.ts`,
        environment: {
          queueUrl: FifoQueueSQS.queueUrl,
        },
      }
    );

    FifoQueueSQS.grantSendMessages(populateQueueWithMessageGroupIdsLambda);
  }
}

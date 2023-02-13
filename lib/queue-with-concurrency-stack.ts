import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_lambda_nodejs as lambda,
  aws_sqs as sqs,
  Duration,
} from "aws-cdk-lib";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class QueueWithConcurrencyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const queueWithConcurrencyDLQ = new sqs.Queue(
      this,
      "queueWithConcurrencyDeadLetterQueue"
    );

    const queueWithConcurrencySQS = new sqs.Queue(
      this,
      "queueWithConcurrencyQueue",
      {
        visibilityTimeout: cdk.Duration.seconds(12), // 6 x lambda timeout
        deadLetterQueue: {
          queue: queueWithConcurrencyDLQ,
          maxReceiveCount: 1, // We can have maxReceiveCount at 1
        },
      }
    );
    const queueWithConcurrencyEventSource = new SqsEventSource(
      queueWithConcurrencySQS,
      {
        maxConcurrency: 10,
        batchSize: 1,
      }
    );

    const sleepLambda = new lambda.NodejsFunction(this, "sleep", {
      timeout: Duration.seconds(2),
      entry: `./lambdas/sleep.ts`,
      reservedConcurrentExecutions: 10,
    });
    sleepLambda.addEventSource(queueWithConcurrencyEventSource);

    const populateQueue = new lambda.NodejsFunction(this, "populate-queue", {
      timeout: Duration.seconds(600),
      entry: `./lambdas/populateQueue.ts`,
      environment: {
        queueUrl: queueWithConcurrencySQS.queueUrl,
      },
    });

    queueWithConcurrencySQS.grantSendMessages(populateQueue);
  }
}

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_lambda_nodejs as lambda,
  aws_sqs as sqs,
  Duration,
} from "aws-cdk-lib";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
export class QueueWithoutConcurrencyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const queueWithoutConcurrencyDLQ = new sqs.Queue(
      this,
      "queueWithoutConcurrencyDeadLetterQueue"
    );

    const queueWithoutConcurrencySQS = new sqs.Queue(
      this,
      "queueWithoutConcurrencyQueue",
      {
        visibilityTimeout: Duration.seconds(11),
        deadLetterQueue: {
          queue: queueWithoutConcurrencyDLQ,
          maxReceiveCount: 1,
        },
      }
    );
    const queueWithoutConcurrencyEventSource = new SqsEventSource(
      queueWithoutConcurrencySQS,
      {
        batchSize: 1,
      }
    );
    const sleepLambda = new lambda.NodejsFunction(this, "sleep", {
      timeout: Duration.seconds(11),
      entry: `./lambdas/sleep.ts`,
    });
    sleepLambda.addEventSource(queueWithoutConcurrencyEventSource);

    const populateQueueLambda = new lambda.NodejsFunction(
      this,
      "populate-queue",
      {
        timeout: Duration.seconds(60),
        entry: `./lambdas/populateQueue.ts`,
        environment: {
          queueUrl: queueWithoutConcurrencySQS.queueUrl,
        },
      }
    );

    queueWithoutConcurrencySQS.grantSendMessages(populateQueueLambda);
  }
}

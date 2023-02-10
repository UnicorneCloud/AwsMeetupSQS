import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_lambda_nodejs as lambda, aws_sqs as sqs } from "aws-cdk-lib";
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
        deadLetterQueue: {
          queue: queueWithConcurrencyDLQ,
          maxReceiveCount: 1,
        },
      }
    );
    const queueWithConcurrencyEventSource = new SqsEventSource(
      queueWithConcurrencySQS,
      {
        maxConcurrency: 10,
      }
    );

    const sleepLambda = new lambda.NodejsFunction(this, "sleep", {
      entry: `./lambdas/sleep.ts`,
    });
    sleepLambda.addEventSource(queueWithConcurrencyEventSource);

    const populateQueue = new lambda.NodejsFunction(this, "populate-queue", {
      entry: `./lambdas/populateQueue.ts`,
      environment: {
        queueUrl: queueWithConcurrencySQS.queueUrl,
      },
    });

    queueWithConcurrencySQS.grantSendMessages(populateQueue);
  }
}

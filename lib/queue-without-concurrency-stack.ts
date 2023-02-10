import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_lambda_nodejs as lambda, aws_sqs as sqs } from "aws-cdk-lib";
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
        deadLetterQueue: {
          queue: queueWithoutConcurrencyDLQ,
          maxReceiveCount: 1,
        },
      }
    );
    const queueWithoutConcurrencyEventSource = new SqsEventSource(
      queueWithoutConcurrencySQS
    );
    const sleepLambda = new lambda.NodejsFunction(this, "sleep", {
      entry: `./lambdas/sleep.ts`,
    });
    sleepLambda.addEventSource(queueWithoutConcurrencyEventSource);

    const populateQueue = new lambda.NodejsFunction(this, "populate-queue", {
      entry: `./lambdas/populateQueue.ts`,
      environment: {
        queueUrl: queueWithoutConcurrencySQS.queueUrl,
      },
    });

    queueWithoutConcurrencySQS.grantSendMessages(populateQueue);
  }
}

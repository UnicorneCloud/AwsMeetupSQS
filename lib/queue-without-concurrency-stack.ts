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
      "integrationDeadLetterQueueDebug"
    );

    const queueWithoutConcurrencySQS = new sqs.Queue(
      this,
      "integrationDeadLetterQueue",
      {
        visibilityTimeout: cdk.Duration.seconds(2),
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
      entry: `./lambas/sleep.ts`,
    });
    sleepLambda.addEventSource(queueWithoutConcurrencyEventSource);

    const populateQueue = new lambda.NodejsFunction(this, "populate-queue", {
      entry: `./lambas/populateQueue.ts`,
      environment: {
        queueUrl: queueWithoutConcurrencySQS.queueUrl,
      },
    });

    queueWithoutConcurrencySQS.grantSendMessages(populateQueue);
  }
}

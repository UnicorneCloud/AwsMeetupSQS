import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_lambda_nodejs as lambda, aws_sqs as sqs } from "aws-cdk-lib";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class QueueWithVisibilityTimeoutStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const queueWithVisibilityTimeoutDLQ = new sqs.Queue(
      this,
      "integrationDeadLetterQueueDebug"
    );

    const queueWithVisibilityTimeoutSQS = new sqs.Queue(
      this,
      "integrationDeadLetterQueue",
      {
        visibilityTimeout: cdk.Duration.seconds(12), // 6 x 2 seconds
        deadLetterQueue: {
          queue: queueWithVisibilityTimeoutDLQ,
          maxReceiveCount: 1,
        },
      }
    );
    const queueWithVisibilityTimeoutEventSource = new SqsEventSource(
      queueWithVisibilityTimeoutSQS
    );
    const sleepLambda = new lambda.NodejsFunction(this, "sleep", {
      entry: `./lambas/sleep.ts`,
    });
    sleepLambda.addEventSource(queueWithVisibilityTimeoutEventSource);

    const populateQueue = new lambda.NodejsFunction(this, "populate-queue", {
      entry: `./lambas/populateQueue.ts`,
      environment: {
        queueUrl: queueWithVisibilityTimeoutSQS.queueUrl,
      },
    });

    queueWithVisibilityTimeoutSQS.grantSendMessages(populateQueue);
  }
}

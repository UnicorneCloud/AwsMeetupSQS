import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_lambda_nodejs as lambda,
  aws_sqs as sqs,
  Duration,
} from "aws-cdk-lib";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class QueueWithVisibilityTimeoutStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const queueWithVisibilityTimeoutDLQ = new sqs.Queue(
      this,
      "queueWithVisibilityTimeoutDeadLetterQueue"
    );

    const queueWithVisibilityTimeoutSQS = new sqs.Queue(
      this,
      "queueWithVisibilityTimeoutQueue",
      {
        visibilityTimeout: cdk.Duration.seconds(66), // 60 seconds
        deadLetterQueue: {
          queue: queueWithVisibilityTimeoutDLQ,
          maxReceiveCount: 5,
        },
      }
    );
    const queueWithVisibilityTimeoutEventSource = new SqsEventSource(
      queueWithVisibilityTimeoutSQS,
      {
        batchSize: 1,
      }
    );
    const sleepLambda = new lambda.NodejsFunction(this, "sleep", {
      timeout: Duration.seconds(11),
      entry: `./lambdas/sleep.ts`,
    });
    sleepLambda.addEventSource(queueWithVisibilityTimeoutEventSource);

    const populateQueue = new lambda.NodejsFunction(this, "populate-queue", {
      timeout: Duration.seconds(60),
      entry: `./lambdas/populateQueue.ts`,
      environment: {
        queueUrl: queueWithVisibilityTimeoutSQS.queueUrl,
      },
    });

    queueWithVisibilityTimeoutSQS.grantSendMessages(populateQueue);
  }
}

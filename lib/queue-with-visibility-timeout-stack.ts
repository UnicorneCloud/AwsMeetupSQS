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
        visibilityTimeout: cdk.Duration.seconds(12), // 6 x lambda timeout
        deadLetterQueue: {
          queue: queueWithVisibilityTimeoutDLQ,
          maxReceiveCount: 5, // 5 here, if we set to 1 we probably have messages in DLQ.
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
      timeout: Duration.seconds(2),
      entry: `./lambdas/sleep.ts`,
      reservedConcurrentExecutions: 10,
    });
    sleepLambda.addEventSource(queueWithVisibilityTimeoutEventSource);

    const populateQueue = new lambda.NodejsFunction(this, "populate-queue", {
      timeout: Duration.seconds(600),
      entry: `./lambdas/populateQueue.ts`,
      environment: {
        queueUrl: queueWithVisibilityTimeoutSQS.queueUrl,
      },
    });

    queueWithVisibilityTimeoutSQS.grantSendMessages(populateQueue);
  }
}

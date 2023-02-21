import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  aws_lambda_nodejs as lambda,
  aws_sqs as sqs,
  Duration,
} from 'aws-cdk-lib';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class SqsFifoLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dlq = new sqs.Queue(this,'dlq', {
      queueName: 'Sqs-Fifo-Lambda-Dlq.fifo',
      fifo: true,
    })

    const queue = new sqs.Queue(this, 'sqs', {
      queueName: 'Sqs-Fifo-Lambda.fifo',
      fifo: true,  // <--- FIFO
      visibilityTimeout: cdk.Duration.seconds(20),
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 1,
      },
      contentBasedDeduplication: true,
    })

    const sqsEventSource = new SqsEventSource(queue, {
      batchSize: 1,
    })

    const sleepLambda = new lambda.NodejsFunction(this, 'lambda-sleep', {
      functionName: 'Sqs-Fifo-Lambda',
      timeout: Duration.seconds(15),
      entry: `./lambdas/sleep.ts`,
    });
    sleepLambda.addEventSource(sqsEventSource);

    const populateQueue = new lambda.NodejsFunction(this, 'lambda-populate-queue', {
      functionName: 'Sqs-Fifo-Lambda-Populate',
      timeout: Duration.seconds(600),
      entry: `./lambdas/populateQueueWithMessageGroupIds.ts`,
      environment: {
        queueUrl: queue.queueUrl,
      },
    });
    queue.grantSendMessages(populateQueue);
  }

}

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  aws_lambda_nodejs as lambda,
  aws_sqs as sqs,
  Duration,
} from 'aws-cdk-lib';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class SqsLambdaWithMaximumConcurrencyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dlq = new sqs.Queue(this,'dlq', {
      queueName: 'Queue-Lambda-With-Maximum-Concurrency-DLQ'
    })

    const queue = new sqs.Queue(this, 'sqs', {
      queueName: 'Queue-Lambda-With-Maximum-Concurrency',
      visibilityTimeout: cdk.Duration.seconds(20),
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 1,
      },
    })

    const sqsEventSource = new SqsEventSource(queue, {
      maxConcurrency: 4, // <--- MAXIMUM CONCURRENCY
      batchSize: 1,
    })

    const sleepLambda = new lambda.NodejsFunction(this, 'lambda-sleep', {
      timeout: Duration.seconds(15),
      entry: `./lambdas/sleep.ts`,
    });
    sleepLambda.addEventSource(sqsEventSource);

    const populateQueue = new lambda.NodejsFunction(this, 'lambda-populate-queue', {
      timeout: Duration.seconds(600),
      entry: `./lambdas/populateQueue.ts`,
      environment: {
        queueUrl: queue.queueUrl,
      },
    });
    queue.grantSendMessages(populateQueue);
  }
}
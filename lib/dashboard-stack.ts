import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  aws_cloudwatch as cloudwatch,
} from 'aws-cdk-lib';
import { Period } from 'aws-cdk-lib/aws-apigateway';

export class DashboardStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const dashboard = new cloudwatch.Dashboard(this, 'dashboard', {
      dashboardName: 'SQS-Lambda',
      start: '-PT1H', // Last hour
    })


    dashboard.addWidgets(
      ...this.buildWidgets(
        'Reserved Concurrency',
        'Queue-Lambda-With-Reserved-Concurrency',
        'Queue-Lambda-With-Reserved-Concurrency',
        'Queue-Lambda-With-Reserved-Concurrency-DLQ'
      )
    );

    dashboard.addWidgets(
      ...this.buildWidgets(
        'SQS Fifo',
        'Sqs-Fifo-Lambda',
        'Sqs-Fifo-Lambda.fifo',
        'Sqs-Fifo-Lambda-Dlq.fifo'
      )
    );

    dashboard.addWidgets(
      ...this.buildWidgets(
        'Maximum Concurrency',
        'Queue-Lambda-With-Maximum-Concurrency',
        'Queue-Lambda-With-Maximum-Concurrency',
        'Queue-Lambda-With-Maximum-Concurrency-DLQ'
      )
    );

  }

  buildWidgets(title: string, lambdaName: string, sqsName: string, dlqName: string): cloudwatch.IWidget[] {

    const widgets = []

    const fctDimensions: cloudwatch.MetricOptions = {
      dimensionsMap: {
        'FunctionName': lambdaName
      }
    };
    const sqsDimensions: cloudwatch.MetricOptions = {
      label: 'Queue',
      dimensionsMap: {
        'QueueName': sqsName
      }

    };
    const dlqDimensions: cloudwatch.MetricOptions = {
      label: 'DLQueue',
      dimensionsMap: {
        'QueueName': dlqName
      }
    };

    const fctInvocations = new cloudwatch.Metric({
      namespace: 'AWS/Lambda',
      metricName: 'Invocations',
      statistic: 'sum',
      period: cdk.Duration.minutes(1),
    });

    const fctThrottles = new cloudwatch.Metric({
      namespace: 'AWS/Lambda',
      metricName: 'Throttles',
      statistic: 'sum',
      period: cdk.Duration.minutes(1),
    });

    const fctConcurrentExecutions = new cloudwatch.Metric({
      namespace: 'AWS/Lambda',
      metricName: 'ConcurrentExecutions',
      statistic: 'avg',
      period: cdk.Duration.minutes(1),
    });


    const sqsNumberOfMessagesVisible = new cloudwatch.Metric({
      namespace: 'AWS/SQS',
      metricName: 'ApproximateNumberOfMessagesVisible',
      statistic: 'sum',
      period: cdk.Duration.minutes(1),
    });

    widgets.push(new cloudwatch.TextWidget({
        markdown: `# ${title}`,
        height: 1,
        width: 18,        
    }))

    widgets.push(new cloudwatch.GraphWidget({
      title: 'Lambda Function',
      width: 9,    
      left: [
        fctConcurrentExecutions.with(fctDimensions)
      ],
      right: [
        fctThrottles.with(fctDimensions)
      ]
    }))

    widgets.push(new cloudwatch.GraphWidget({
      title: 'Number of msg SQS vs DLQ',
      width: 9,    
      left: [
        sqsNumberOfMessagesVisible.with(sqsDimensions)
      ],
      right: [
        sqsNumberOfMessagesVisible.with(dlqDimensions)
      ]
    }))

    return widgets
  }
}

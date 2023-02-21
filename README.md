# AWS MEETUP SQS LAMBDA - DEMO

## Deploying

```
yarn deploy
```

## Demo

Populate Queue

```
aws lambda invoke --function-name "Queue-Lambda-With-Reserved-Concurrency-Populate"  --profile meetup /dev/null
aws lambda invoke --function-name "Sqs-Fifo-Lambda-Populate" --profile meetup /dev/null
aws lambda invoke --function-name "Queue-Lambda-With-Maximum-Concurrency-Populate" --profile meetup /dev/null
```

Purge DLQ (usefull when we re-run demo)
```
aws sqs purge-queue --queue-url https://sqs.ca-central-1.amazonaws.com/660166667835/Queue-Lambda-With-Reserved-Concurrency --profile meetup
aws sqs purge-queue --queue-url https://sqs.ca-central-1.amazonaws.com/660166667835/Queue-Lambda-With-Reserved-Concurrency-DLQ --profile meetup
aws sqs purge-queue --queue-url https://sqs.ca-central-1.amazonaws.com/660166667835/Sqs-Fifo-Lambda.fifo --profile meetup
aws sqs purge-queue --queue-url https://sqs.ca-central-1.amazonaws.com/660166667835/Sqs-Fifo-Lambda-Dlq.fifo --profile meetup
aws sqs purge-queue --queue-url https://sqs.ca-central-1.amazonaws.com/660166667835/Queue-Lambda-With-Maximum-Concurrency --profile meetup
aws sqs purge-queue --queue-url https://sqs.ca-central-1.amazonaws.com/660166667835/Queue-Lambda-With-Maximum-Concurrency-DLQ --profile meetup

```

## Dashboard

The dashboard url is: https://ca-central-1.console.aws.amazon.com/cloudwatch/home?region=ca-central-1#dashboards:name=SQS-Lambda


#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { QueueWithoutConcurrencyStack } from "../lib/queue-without-concurrency-stack";
import { QueueWithVisibilityTimeoutStack } from "../lib/queue-with-visibility-timeout-stack";
import { QueueWithConcurrencyStack } from "../lib/queue-with-concurrency-stack";
import { applyLumigoLogging } from "../lib/lumigo";
import { FifoQueueStack } from "../lib/fifo-queue-stack";
const app = new cdk.App();

const props = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
};

const stacks = [];

const queueWithoutConcurrencyStack = new QueueWithoutConcurrencyStack(
  app,
  "QueueWithoutConcurrencyStack",
  props
);
stacks.push(queueWithoutConcurrencyStack);

const queueWithVisibilityTimeoutStack = new QueueWithVisibilityTimeoutStack(
  app,
  "QueueWithVisibilityTimeoutStack",
  props
);
stacks.push(queueWithVisibilityTimeoutStack);

const queueWithConcurrencyStack = new QueueWithConcurrencyStack(
  app,
  "QueueWithConcurrencyStack",
  props
);
stacks.push(queueWithConcurrencyStack);

const fifoQueueStack = new FifoQueueStack(app, "FifoQueueStack", props);
stacks.push(fifoQueueStack);

applyLumigoLogging(stacks);

app.synth();

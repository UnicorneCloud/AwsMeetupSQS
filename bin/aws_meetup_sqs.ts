#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { QueueWithoutConcurrencyStack } from "../lib/queue-without-concurrency-stack";
import { QueueWithVisibilityTimeoutStack } from "../lib/queue-with-visibility-timeout-stack";
import { QueueWithConcurrencyStack } from "../lib/queue-with-concurrency-stack";

const app = new cdk.App();

const props = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
};
new QueueWithoutConcurrencyStack(app, "QueueWithoutConcurrencyStack", props);
new QueueWithVisibilityTimeoutStack(
  app,
  "QueueWithVisibilityTimeoutStack",
  props
);

new QueueWithConcurrencyStack(app, "QueueWithConcurrencyStack", props);

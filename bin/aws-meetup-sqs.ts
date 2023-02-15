#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { 
  SqsFifoLambdaStack,
  SqsLambdaWithMaximumConcurrencyStack,
  SqsLambdaWithReservedConcurrencyStack 
} from "../lib";
import { applyLumigoLogging } from "../lib/lumigo";
const app = new cdk.App();

const props = {
  env: {
    account: '660166667835',
    region: 'ca-central-1',
  },
};

const stacks = [];

const sqsFifoLambdaStack = new SqsFifoLambdaStack(app, 'SqsFifoLambdaStack',
  props
);

const sqsLambdaWithMaximumConcurrencyStack = new SqsLambdaWithMaximumConcurrencyStack(app, 'SqsLambdaWithMaximumConcurrencyStack',
  props
);

const sqsLambdaWithReservedConcurrencyStack = new SqsLambdaWithReservedConcurrencyStack(app, 'SqsLambdaWithReservedConcurrencyStack',
  props
);

applyLumigoLogging(app);



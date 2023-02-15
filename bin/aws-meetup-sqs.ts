#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { 
  DashboardStack,
  SqsFifoLambdaStack,
  SqsLambdaWithMaximumConcurrencyStack,
  SqsLambdaWithReservedConcurrencyStack 
} from "../lib";
import { applyLumigoLogging } from "../lib/lumigo";
import { Dashboard } from "aws-cdk-lib/aws-cloudwatch";
const app = new cdk.App();

const props = {
  env: {
    account: '660166667835',
    region: 'ca-central-1',
  },
};

new SqsFifoLambdaStack(app, 'SqsFifoLambdaStack', props);

new SqsLambdaWithMaximumConcurrencyStack(app, 'SqsLambdaWithMaximumConcurrencyStack', props);

new SqsLambdaWithReservedConcurrencyStack(app, 'SqsLambdaWithReservedConcurrencyStack', props);

new DashboardStack(app, 'DashboardStack', props)



applyLumigoLogging(app);



import {
  SecretValue,
  Stack,
  Aspects,
  IAspect,
  aws_lambda as lambda,
  aws_iam as iam,
} from "aws-cdk-lib";
import { IConstruct } from "constructs";

const LUMIGO_TOKEN_SSM_NAME = "LumigoToken";

/** Create a lumigo token in secretsManager via the following command:
 aws secretsmanager create-secret --name LumigoToken \
  --description "Token for lumigo" \
  --secret-string YOUR_LUMIGO_TOKEN --profile yourProfile
*/
export function applyLumigoLogging(node: IConstruct): void {
  const visitor = new LambdaFunctionVisitor();
  Aspects.of(node).add(visitor);
}

class LambdaFunctionVisitor implements IAspect {
  public visit(node: IConstruct): void {
    if (node instanceof lambda.Function) {
      const lumigoExtensionArn =
        "arn:aws:lambda:ca-central-1:114300393969:layer:lumigo-extension:3";
      const lumigoLayerArn =
        "arn:aws:lambda:ca-central-1:114300393969:layer:lumigo-node-tracer:230";

      const tracingLayer = lambda.LayerVersion.fromLayerVersionArn(
        node,
        "TracingLayer",
        lumigoLayerArn
      );
      const lambdaExtensions = lambda.LayerVersion.fromLayerVersionArn(
        node,
        "PerformanceLayer",
        lumigoExtensionArn
      );

      node.addEnvironment("AWS_LAMBDA_EXEC_WRAPPER", "/opt/lumigo_wrapper");
      node.addEnvironment(
        "LUMIGO_TRACER_TOKEN",
        SecretValue.secretsManager(LUMIGO_TOKEN_SSM_NAME)
          .unsafeUnwrap()
          .toString()
      );
      node.addLayers(tracingLayer, lambdaExtensions);

      node.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ["xray:PutTraceSegments", "xray:PutTelemetryRecords"],
          resources: ["*"],
        })
      );
    }

    if (node instanceof lambda.CfnFunction) {
      node.tracingConfig = { mode: lambda.Tracing.ACTIVE };
    }
  }
}

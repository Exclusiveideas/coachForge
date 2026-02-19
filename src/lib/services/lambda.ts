import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

let _lambda: LambdaClient | null = null;
function getLambdaClient() {
  if (!_lambda) {
    _lambda = new LambdaClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _lambda;
}

export async function invokeProcessKnowledge(knowledgeId: string) {
  const command = new InvokeCommand({
    FunctionName: process.env.LAMBDA_PROCESS_KNOWLEDGE_ARN,
    InvocationType: "Event",
    Payload: Buffer.from(JSON.stringify({ knowledgeId })),
  });

  await getLambdaClient().send(command);
}

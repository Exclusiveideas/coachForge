# CoachForge Knowledge Processor Lambda

Processes knowledge base entries by chunking text and generating OpenAI embeddings.

## Environment Variables

Set these in the AWS Lambda console:

- `DATABASE_URL` — Supabase Postgres connection string
- `OPENAI_API_KEY` — OpenAI API key

## Deployment

```bash
cd lambda/process-knowledge
npm install
zip -r function.zip index.mjs node_modules package.json
```

Then in AWS Lambda console:

1. Create function → Author from scratch
2. Runtime: **Node.js 20.x**
3. Handler: **index.handler**
4. Upload the `function.zip`
5. Configuration:
   - Timeout: **900 seconds** (15 min)
   - Memory: **256 MB**
6. Add environment variables (`DATABASE_URL`, `OPENAI_API_KEY`)

## Vercel Environment Variables

Add these to your Vercel project:

- `AWS_ACCESS_KEY_ID` — IAM user with `lambda:InvokeFunction` permission
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` — e.g. `eu-west-1`
- `LAMBDA_PROCESS_KNOWLEDGE_ARN` — the Lambda function ARN

## Testing

Invoke manually from Lambda console with test event:

```json
{
  "knowledgeId": "your-knowledge-id-here"
}
```

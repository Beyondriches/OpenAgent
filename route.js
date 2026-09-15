export async function GET() {
  return Response.json({
    ok: true,
    agent: 'Theo Crypto Agent',
    version: '0.2',
    mode: 'paper-trading',
    message: 'API route is working.'
  });
}

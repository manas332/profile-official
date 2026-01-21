export default function TestEnvPage() {
  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Environment Variables Test</h1>
      <ul>
        <li>NEXT_PUBLIC_FIREBASE_API_KEY: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ Set" : "❌ Missing"}</li>
        <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✅ Set" : "❌ Missing"}</li>
        <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅ Set" : "❌ Missing"}</li>
        <li>RESEND_API_KEY: {process.env.RESEND_API_KEY ? "✅ Set (server-only)" : "❌ Missing"}</li>
      </ul>
      <p style={{ marginTop: "20px", color: "red" }}>
        <strong>Note:</strong> If variables show as missing, try:
        <br />1. Delete .next folder
        <br />2. Restart dev server
      </p>
    </div>
  );
}

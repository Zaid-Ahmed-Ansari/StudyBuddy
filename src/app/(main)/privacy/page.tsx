export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-accent text-center mb-6">
        Privacy Policy
      </h1>
      <div className="space-y-6 text-sm text-gray-700">
        <p>
          This Privacy Policy explains how StudyBuddy collects, uses, and
          protects your information.
        </p>

        <h2 className="text-lg font-semibold text-accent">1. Data We Collect</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Username and email during account creation.</li>
          <li>Chat messages and uploaded files (used only for your access).</li>
          <li>Basic usage analytics to improve the app.</li>
        </ul>

        <h2 className="text-lg font-semibold text-accent">2. Use of Data</h2>
        <p>We use your data to:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Provide personalized features like notes, summaries, and chats.</li>
          <li>Improve our platform and fix bugs.</li>
        </ul>

        <h2 className="text-lg font-semibold text-accent">3. Data Sharing</h2>
        <p>
          We do not sell or share your personal information with third parties.
          Your data is kept private and secure.
        </p>

        <h2 className="text-lg font-semibold text-accent">4. Security</h2>
        <p>
          We use modern cloud infrastructure and encryption methods to protect
          your data. However, no system is 100% secure.
        </p>

        <h2 className="text-lg font-semibold text-accent">5. Third-Party Services</h2>
        <p>
          We may use services like Google or Stream.io for authentication and
          chat. These providers may have access to minimal required data.
        </p>

        <h2 className="text-lg font-semibold text-accent">6. Your Rights</h2>
        <p>
          You can request data deletion by contacting us at ahmedzaid2627@gmail.com.
          
        </p>

        <h2 className="text-lg font-semibold text-accent">7. Updates</h2>
        <p>
          We may update this policy. We’ll notify you of significant changes.
        </p>
      </div>
    </main>
  );
}

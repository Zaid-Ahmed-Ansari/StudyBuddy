import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Section,
  Text,
  Container,
} from '@react-email/components';

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({ username, otp }: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>StudyBuddy Verification Code</title>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrKz4r9HtSuqzj.woff2',
            format: 'woff2',
          }}
        />
      </Head>

      <Preview>Your StudyBuddy verification code is: {otp}</Preview>

      <Section style={main}>
        <Container style={card}>
          <Heading as="h2" style={heading}>
            👋 Hi {username},
          </Heading>
          <Text style={paragraph}>
            Thanks for signing up with <strong>StudyBuddy</strong>! To complete your registration, enter the verification code below:
          </Text>
          <Text style={code}>{otp}</Text>
          <Text style={footer}>
            Didn’t request this code? You can safely ignore this email.
          </Text>
        </Container>
        <Text style={copyright}>
          © {new Date().getFullYear()} StudyBuddy • All rights reserved.
        </Text>
      </Section>
    </Html>
  );
}

// === Styles ===

const main = {
  backgroundColor: '#f4f4f7',
  padding: '40px 0',
  fontFamily: '"Inter", sans-serif',
};

const card = {
  maxWidth: '480px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  padding: '32px',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
};

const heading = {
  fontSize: '24px',
  color: '#1E293B',
  marginBottom: '16px',
};

const paragraph = {
  fontSize: '16px',
  color: '#475569',
  lineHeight: '1.6',
};

const code = {
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  backgroundColor: '#E0F2FE',
  color: '#0284C7',
  padding: '12px 24px',
  borderRadius: '8px',
  letterSpacing: '4px',
  margin: '24px 0',
};

const footer = {
  fontSize: '14px',
  color: '#94A3B8',
  marginTop: '24px',
};

const copyright = {
  fontSize: '12px',
  color: '#94A3B8',
  textAlign: 'center' as const,
  marginTop: '32px',
};

import React from 'react';
import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Container,
} from '@react-email/components';

interface SignupWelcomeEmailProps {
  name: string;
  userId: string;
  loginLink: string;
}

const SignupWelcomeEmail: React.FC<SignupWelcomeEmailProps> = ({
  name,
  userId,
  loginLink,
}) => (
  <Html lang="en" dir="ltr">
    <Head>
      <title>Welcome to CROWN</title>
      <Font
        fontFamily="Roboto"
        fallbackFontFamily="Verdana"
        webFont={{
          url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
          format: 'woff2',
        }}
        fontWeight={400}
        fontStyle="normal"
      />
    </Head>
    <Preview>Welcome to CROWN! Your account has been successfully created.</Preview>
    <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Roboto, Verdana, sans-serif' }}>
      <Section>
        <Row>
          <Heading as="h2" style={{ color: '#1f2937', marginBottom: '20px' }}>
            Welcome to CROWN, {name}!
          </Heading>
        </Row>
        <Row>
          <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '16px' }}>
            Congratulations! Your account has been successfully created.
          </Text>
        </Row>
        <Row>
          <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '16px' }}>
            Your User ID: <strong>{userId}</strong>
          </Text>
        </Row>
        <Row>
          <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '16px' }}>
            Click the link below to login to your account and access your dashboard (or copy and paste it into your browser):
          </Text>
        </Row>
        <Row>
          <div style={{ backgroundColor: '#f0f9ff', border: '2px solid #3b82f6', borderRadius: '8px', padding: '16px', marginBottom: '24px', textAlign: 'center' }}>
            <Text style={{ color: '#4f46e5', fontSize: '16px', lineHeight: '24px', wordBreak: 'break-all', fontWeight: 'bold', margin: '0' }}>
              {loginLink}
            </Text>
          </div>
        </Row>
        <Row>
          <Text style={{ color: '#6b7280', fontSize: '14px', lineHeight: '20px', marginTop: '24px' }}>
            If you didn't create this account, please ignore this email or contact support.
          </Text>
        </Row>
        <Row>
          <Text style={{ color: '#6b7280', fontSize: '14px', lineHeight: '20px', marginTop: '16px' }}>
            This login link will expire in 24 hours for security purposes.
          </Text>
        </Row>
      </Section>
    </Container>
  </Html>
);

export default SignupWelcomeEmail;


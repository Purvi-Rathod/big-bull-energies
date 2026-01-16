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

interface PasswordResetEmailProps {
  name: string;
  resetLink: string;
}

const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  name,
  resetLink,
}) => (
  <Html lang="en" dir="ltr">
    <Head>
      <title>Reset Your Password - CROWN</title>
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
    <Preview>Reset your CROWN account password</Preview>
    <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Roboto, Verdana, sans-serif' }}>
      <Section>
        <Row>
          <Heading as="h2" style={{ color: '#1f2937', marginBottom: '20px' }}>
            Reset Your Password
          </Heading>
        </Row>
        <Row>
          <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '16px' }}>
            Hello {name},
          </Text>
        </Row>
        <Row>
          <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '16px' }}>
            We received a request to reset your password for your CROWN account. If you didn't make this request, you can safely ignore this email.
          </Text>
        </Row>
        <Row>
          <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '16px' }}>
            Click the link below to reset your password (or copy and paste it into your browser):
          </Text>
        </Row>
        <Row>
          <div style={{ backgroundColor: '#f0f9ff', border: '2px solid #3b82f6', borderRadius: '8px', padding: '16px', marginBottom: '24px', textAlign: 'center' }}>
            <Text style={{ color: '#4f46e5', fontSize: '16px', lineHeight: '24px', wordBreak: 'break-all', fontWeight: 'bold', margin: '0' }}>
              {resetLink}
            </Text>
          </div>
        </Row>
        <Row>
          <Text style={{ color: '#dc2626', fontSize: '14px', lineHeight: '20px', marginTop: '24px', fontWeight: 'bold' }}>
            ⚠️ This link will expire in 1 hour for security purposes.
          </Text>
        </Row>
        <Row>
          <Text style={{ color: '#6b7280', fontSize: '14px', lineHeight: '20px', marginTop: '16px' }}>
            If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.
          </Text>
        </Row>
      </Section>
    </Container>
  </Html>
);

export default PasswordResetEmail;


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

interface VoucherUsedEmailProps {
  name: string;
  voucherId: string;
  amount: number;
  investmentValue: number;
  usedBy: string;
  dashboardLink: string;
}

const VoucherUsedEmail: React.FC<VoucherUsedEmailProps> = ({
  name,
  voucherId,
  amount,
  investmentValue,
  usedBy,
  dashboardLink,
}) => (
  <Html lang="en" dir="ltr">
    <Head>
      <title>Voucher Used - BIG BULL</title>
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
    <Preview>Your voucher {voucherId} was used for an investment of ${investmentValue.toFixed(2)}</Preview>
    <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Roboto, Verdana, sans-serif' }}>
      <Section>
        <Row>
          <Heading as="h2" style={{ color: '#1f2937', marginBottom: '20px' }}>
            Voucher Used, {name}
          </Heading>
        </Row>
        <Row>
          <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '16px' }}>
            Your voucher has been applied to an investment.
          </Text>
        </Row>
        <Row>
          <div style={{ backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <Text style={{ color: '#92400e', fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', marginTop: '0' }}>
              Voucher Usage Details
            </Text>
            <div style={{ color: '#374151', fontSize: '14px', lineHeight: '22px' }}>
              <Text style={{ margin: '8px 0', color: '#374151' }}>
                <strong>Voucher ID:</strong> {voucherId}
              </Text>
              <Text style={{ margin: '8px 0', color: '#374151' }}>
                <strong>Voucher Amount:</strong> ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={{ margin: '8px 0', color: '#374151' }}>
                <strong>Investment Value Applied:</strong> ${investmentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={{ margin: '8px 0', color: '#374151' }}>
                <strong>Used By:</strong> {usedBy}
              </Text>
            </div>
          </div>
        </Row>
        <Row>
          <Text style={{ color: '#6b7280', fontSize: '14px', lineHeight: '20px', marginTop: '24px' }}>
            View your vouchers and transactions in your dashboard:
          </Text>
        </Row>
        <Row>
          <div style={{ backgroundColor: '#f0f9ff', border: '2px solid #3b82f6', borderRadius: '8px', padding: '16px', marginBottom: '24px', textAlign: 'center' }}>
            <Text style={{ color: '#4f46e5', fontSize: '16px', lineHeight: '24px', wordBreak: 'break-all', fontWeight: 'bold', margin: '0' }}>
              {dashboardLink}
            </Text>
          </div>
        </Row>
        <Row>
          <Text style={{ color: '#6b7280', fontSize: '14px', lineHeight: '20px', marginTop: '16px' }}>
            Thank you for using BIG BULL!
          </Text>
        </Row>
      </Section>
    </Container>
  </Html>
);

export default VoucherUsedEmail;

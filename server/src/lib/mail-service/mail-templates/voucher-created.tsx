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

interface VoucherCreatedEmailProps {
  name: string;
  voucherId: string;
  amount: number;
  investmentValue: number;
  expiryDate: string;
  dashboardLink: string;
  source?: 'wallet' | 'payment';
}

const VoucherCreatedEmail: React.FC<VoucherCreatedEmailProps> = ({
  name,
  voucherId,
  amount,
  investmentValue,
  expiryDate,
  dashboardLink,
  source = 'wallet',
}) => (
  <Html lang="en" dir="ltr">
    <Head>
      <title>Voucher Created - BIG BULL</title>
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
    <Preview>Your voucher {voucherId} has been created. Investment value: ${investmentValue.toFixed(2)}</Preview>
    <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Roboto, Verdana, sans-serif' }}>
      <Section>
        <Row>
          <Heading as="h2" style={{ color: '#1f2937', marginBottom: '20px' }}>
            Voucher Created, {name}!
          </Heading>
        </Row>
        <Row>
          <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '16px' }}>
            Your voucher has been created successfully. You can share the voucher code with others or use it yourself for an investment.
          </Text>
        </Row>
        <Row>
          <div style={{ backgroundColor: '#ecfdf5', border: '2px solid #10b981', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <Text style={{ color: '#065f46', fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', marginTop: '0' }}>
              Voucher Details
            </Text>
            <div style={{ color: '#374151', fontSize: '14px', lineHeight: '22px' }}>
              <Text style={{ margin: '8px 0', color: '#374151' }}>
                <strong>Voucher ID:</strong> {voucherId}
              </Text>
              <Text style={{ margin: '8px 0', color: '#374151' }}>
                <strong>Purchase Amount:</strong> ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={{ margin: '8px 0', color: '#374151' }}>
                <strong>Investment Value:</strong> ${investmentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (2x)
              </Text>
              <Text style={{ margin: '8px 0', color: '#374151' }}>
                <strong>Expires:</strong> {expiryDate}
              </Text>
              {source === 'payment' && (
                <Text style={{ margin: '8px 0', color: '#6b7280', fontSize: '12px' }}>
                  Complete your payment to activate this voucher.
                </Text>
              )}
            </div>
          </div>
        </Row>
        <Row>
          <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '16px' }}>
            View and manage your vouchers in your dashboard:
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
          <Text style={{ color: '#6b7280', fontSize: '14px', lineHeight: '20px', marginTop: '24px' }}>
            Thank you for using BIG BULL!
          </Text>
        </Row>
      </Section>
    </Container>
  </Html>
);

export default VoucherCreatedEmail;

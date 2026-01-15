#!/bin/bash
# Script to trigger daily calculations job via API
# This will process all users once (idempotency checks prevent duplicates)

set -e

# Configuration
API_URL="${API_URL:-https://api.crownbankers.com/api/v1}"
ADMIN_TOKEN="${ADMIN_TOKEN}"

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Error: ADMIN_TOKEN environment variable is required"
  echo "Usage: ADMIN_TOKEN=your_token ./scripts/trigger-daily-calculations.sh"
  exit 1
fi

echo "🚀 Triggering daily calculations job..."
echo "📡 API URL: $API_URL"

# Trigger the job
RESPONSE=$(curl -s -X POST "$API_URL/admin/trigger-daily-calculations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "includeROI": true,
    "includeBinary": true,
    "includeReferral": true
  }')

# Check if response contains job ID
if echo "$RESPONSE" | grep -q "jobId"; then
  JOB_ID=$(echo "$RESPONSE" | grep -o '"jobId":"[^"]*' | cut -d'"' -f4)
  echo "✅ Job started successfully!"
  echo "📋 Job ID: $JOB_ID"
  echo ""
  echo "💡 To check job status, run:"
  echo "   curl -H \"Authorization: Bearer $ADMIN_TOKEN\" $API_URL/admin/calculation-job/latest"
  echo ""
  echo "⏳ The job is running in the background. Each user will be processed only once"
  echo "   due to idempotency checks (ROI: lastRoiDate, Binary: transaction history)."
else
  echo "❌ Failed to trigger job:"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  exit 1
fi

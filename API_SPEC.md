# API Specification - ISE Policy Visualizer

## Overview

The application has a single API endpoint that receives GitHub URLs pointing to policy data. This endpoint is called by an external Python script and triggers the frontend to load and display new data.

---

## Authentication

**Method:** HTTP Basic Authentication

**Credentials:**
- Username: `taimoor`
- Password: (provided separately, stored as environment variable)

**Header Format:**
```
Authorization: Basic dGFpbW9vcjpbcGFzc3dvcmRd
```

(Base64 encoded `username:password`)

**Authentication Failures:**
- Return HTTP 401 Unauthorized
- Do not process request
- Do not change application state

---

## Endpoint: Load Data

### Request

**Method:** `POST`

**URL:** `/api/load`

**Headers:**
```
Authorization: Basic dGFpbW9vcjpbcGFzc3dvcmRd
Content-Type: application/json
```

**Body:**
```json
{
  "dataUrl": "https://raw.githubusercontent.com/taimoorahmed1/iseflowproject/7dec47b/configs/processed_data.json"
}
```

**Field Descriptions:**
- `dataUrl` (string, required): Full URL to the JSON file on GitHub
  - Must start with: `https://raw.githubusercontent.com/taimoorahmed91/iseflowproject/`
  - Must end with: `/configs/processed_data.json`
  - Middle section is the commit hash (40-character hex or short form)

### Validation Rules

**URL Format Validation:**
1. Must be a valid HTTPS URL
2. Domain must be `raw.githubusercontent.com`
3. Repository path must be `taimoorahmed91/iseflowproject`
4. File path must be `configs/processed_data.json`
5. Commit hash format: alphanumeric, typically 7-40 characters

**Validation Examples:**

✅ **Valid URLs:**
```
https://raw.githubusercontent.com/taimoorahmed91/iseflowproject/a1b2c3d/configs/processed_data.json
https://raw.githubusercontent.com/taimoorahmed91/iseflowproject/abc123def456/configs/processed_data.json
https://raw.githubusercontent.com/taimoorahmed91/iseflowproject/1234567890abcdef1234567890abcdef12345678/configs/processed_data.json
```

❌ **Invalid URLs:**
```
https://raw.githubusercontent.com/other-user/repo/main/configs/processed_data.json
(wrong repository)

https://raw.githubusercontent.com/taimoorahmed91/iseflowproject/main/data.json
(wrong file path)

http://raw.githubusercontent.com/taimoorahmed91/iseflowproject/abc/configs/processed_data.json
(HTTP instead of HTTPS)
```

### Response: Success

**HTTP Status:** `200 OK`

**Body:**
```json
{
  "status": "loading",
  "message": "Data fetch initiated",
  "dataUrl": "https://raw.githubusercontent.com/taimoorahmed91/iseflowproject/7dec47b/configs/processed_data.json"
}
```

**What happens next:**
1. API broadcasts event to all connected clients via SSE
2. Clients receive event and display "New request received"
3. Clients fetch data from provided URL
4. Clients parse and display data

### Response: Validation Error

**HTTP Status:** `400 Bad Request`

**Body:**
```json
{
  "status": "error",
  "message": "Invalid URL format",
  "details": "URL must be from repository taimoorahmed91/iseflowproject"
}
```

**Common validation errors:**

**Missing dataUrl field:**
```json
{
  "status": "error",
  "message": "Missing required field: dataUrl"
}
```

**Wrong repository:**
```json
{
  "status": "error",
  "message": "Invalid repository",
  "details": "Only URLs from taimoorahmed91/iseflowproject are allowed"
}
```

**Wrong file path:**
```json
{
  "status": "error",
  "message": "Invalid file path",
  "details": "File path must be configs/processed_data.json"
}
```

### Response: Authentication Error

**HTTP Status:** `401 Unauthorized`

**Headers:**
```
WWW-Authenticate: Basic realm="ISE Visualizer"
```

**Body:**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

### Response: Server Error

**HTTP Status:** `500 Internal Server Error`

**Body:**
```json
{
  "status": "error",
  "message": "Internal server error",
  "details": "Failed to process request"
}
```

---

## Endpoint: Server-Sent Events (SSE)

### Purpose

Allows browsers to receive real-time notifications when new data is pushed.

### Request

**Method:** `GET`

**URL:** `/api/events`

**Headers:**
```
Accept: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Authentication:** Not required (public endpoint)

### Response

**HTTP Status:** `200 OK`

**Headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Event Stream Format:**
```
event: data-update
data: {"dataUrl": "https://raw.githubusercontent.com/..."}

```

**Event Types:**

**1. Connection Established:**
```
event: connected
data: {"message": "Connected to event stream"}
```

**2. New Data Available:**
```
event: data-update
data: {"dataUrl": "https://raw.githubusercontent.com/taimoorahmed91/iseflowproject/abc123/configs/processed_data.json"}
```

**3. Keepalive (every 30 seconds):**
```
event: ping
data: {"timestamp": "2025-01-31T18:00:00Z"}
```

### Client Implementation

**JavaScript Example:**
```javascript
const eventSource = new EventSource('/api/events');

eventSource.addEventListener('data-update', (event) => {
  const data = JSON.parse(event.data);
  // Trigger data fetch from data.dataUrl
});

eventSource.addEventListener('error', () => {
  // Handle connection error
  // Attempt reconnection
});
```

### Connection Management

**Reconnection:**
- Client should automatically reconnect if connection drops
- Exponential backoff: 1s, 2s, 4s, 8s, max 30s
- Show connection status to user if offline for >10 seconds

**Resource Limits:**
- Maximum 100 concurrent connections (single user shouldn't hit this)
- Idle timeout: 5 minutes of no activity
- Automatic reconnection on timeout

---

## Example API Call from Python Script

```python
import requests
import base64

# Configuration
API_URL = "https://ise-visualizer.vercel.app/api/load"
USERNAME = "taimoor"
PASSWORD = "your-password-here"
DATA_URL = "https://raw.githubusercontent.com/taimoorahmed91/iseflowproject/abc123/configs/processed_data.json"

# Create Basic Auth header
credentials = f"{USERNAME}:{PASSWORD}"
encoded_credentials = base64.b64encode(credentials.encode()).decode()
headers = {
    "Authorization": f"Basic {encoded_credentials}",
    "Content-Type": "application/json"
}

# Make request
payload = {"dataUrl": DATA_URL}
response = requests.post(API_URL, json=payload, headers=headers)

# Check response
if response.status_code == 200:
    print("✓ Data push successful")
    print(f"  Response: {response.json()}")
elif response.status_code == 401:
    print("✗ Authentication failed")
elif response.status_code == 400:
    print("✗ Invalid request")
    print(f"  Error: {response.json()['message']}")
else:
    print(f"✗ Unexpected error: {response.status_code}")
```

---

## Rate Limiting

**Current limits:** None

**Future considerations:**
- If abuse occurs, implement rate limiting
- Suggested: 100 requests per hour per IP
- For legitimate use (single user script), this won't be an issue

---

## CORS Policy

**Allowed Origins:**
- Same origin only (Vercel deployment URL)
- No cross-origin requests allowed
- Python script calls server-side (not affected by CORS)

---

## Monitoring & Logging

**Log these events:**
- ✓ Successful API calls (timestamp, dataUrl)
- ✗ Failed authentication attempts (timestamp, IP)
- ✗ Validation errors (timestamp, error type)
- ℹ SSE connections (connect/disconnect)

**Privacy:**
- Do not log passwords
- Do not log full authentication headers
- Log only necessary information for debugging

---

## Security Considerations

### Environment Variables

Store credentials securely:

**In Vercel:**
```
BASIC_AUTH_USERNAME=taimoor
BASIC_AUTH_PASSWORD=[secure-password]
```

**In local development (.env.local):**
```
BASIC_AUTH_USERNAME=taimoor
BASIC_AUTH_PASSWORD=[secure-password]
```

**Never commit:**
- .env.local
- .env
- Any file containing passwords

### Password Requirements

**Recommendations for password:**
- Minimum 16 characters
- Mix of letters, numbers, symbols
- Randomly generated
- Rotated every 90 days

### Attack Prevention

**Brute Force Protection:**
- Consider adding rate limiting on authentication failures
- Temporary IP ban after 10 failed attempts
- Exponential backoff on failed attempts

**URL Injection:**
- Strict validation prevents malicious URLs
- Only allow exact repository match
- No URL parameters or query strings allowed

---

## Testing the API

### Manual Testing with curl

**Successful request:**
```bash
curl -X POST https://ise-visualizer.vercel.app/api/load \
  -H "Authorization: Basic dGFpbW9vcjpwYXNzd29yZA==" \
  -H "Content-Type: application/json" \
  -d '{"dataUrl": "https://raw.githubusercontent.com/taimoorahmed91/iseflowproject/abc123/configs/processed_data.json"}'
```

**Expected response:**
```json
{"status":"loading","message":"Data fetch initiated"}
```

**Invalid auth:**
```bash
curl -X POST https://ise-visualizer.vercel.app/api/load \
  -H "Authorization: Basic invalid" \
  -H "Content-Type: application/json" \
  -d '{"dataUrl": "https://raw.githubusercontent.com/taimoorahmed91/iseflowproject/abc123/configs/processed_data.json"}'
```

**Expected response:**
```
HTTP/1.1 401 Unauthorized
{"status":"error","message":"Unauthorized"}
```

**Invalid URL:**
```bash
curl -X POST https://ise-visualizer.vercel.app/api/load \
  -H "Authorization: Basic dGFpbW9vcjpwYXNzd29yZA==" \
  -H "Content-Type: application/json" \
  -d '{"dataUrl": "https://example.com/data.json"}'
```

**Expected response:**
```json
{"status":"error","message":"Invalid repository"}
```

### Testing SSE Connection

```bash
curl -N https://ise-visualizer.vercel.app/api/events
```

**Expected output:**
```
event: connected
data: {"message":"Connected to event stream"}

event: ping
data: {"timestamp":"2025-01-31T18:00:00Z"}
```

---

## Troubleshooting

### Common Issues

**Issue:** 401 Unauthorized
**Cause:** Incorrect password or missing Authorization header
**Solution:** Verify credentials, check Base64 encoding

**Issue:** 400 Bad Request - Invalid URL
**Cause:** URL doesn't match expected pattern
**Solution:** Check repository name, file path, URL format

**Issue:** SSE connection drops immediately
**Cause:** Server or proxy timeout
**Solution:** Implement keepalive ping events every 30s

**Issue:** Multiple clients not updating simultaneously
**Cause:** SSE not implemented or not broadcasting correctly
**Solution:** Verify event broadcast to all connected clients

---

## API Versioning

**Current version:** 1.0

**Future versioning:**
If breaking changes are needed, use URL versioning:
- Current: `/api/load`
- Future: `/api/v2/load`

This allows old Python scripts to continue working while new features are added.

---

## Changelog

**v1.0 (Initial Release)**
- POST /api/load endpoint
- GET /api/events (SSE) endpoint
- Basic Authentication
- URL validation
- Error handling
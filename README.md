# ISE Policy Flow Visualizer

A Next.js web application that visualizes Cisco ISE (Identity Services Engine) network access policies as interactive flowcharts.

## Features

- **API-triggered loading**: External scripts push data via authenticated API endpoint
- **Real-time updates**: Server-Sent Events (SSE) broadcast data to all connected clients
- **Three application states**: Idle → Loading → Displaying
- **Interactive flowcharts**: Visualize authentication and authorization policy flows
- **Dark theme**: Desktop-optimized interface

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- React Flow
- Tailwind CSS
- Server-Sent Events (SSE)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment variables file
# .env.local is already created with placeholder credentials
```

### Environment Variables

Edit `.env.local`:

```env
BASIC_AUTH_USERNAME=taimoor
BASIC_AUTH_PASSWORD=your-secure-password-here
```

### Development

```bash
# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## API Usage

### POST /api/load

Trigger data loading from GitHub.

**Authentication**: HTTP Basic Auth

**Request Body**:
```json
{
  "dataUrl": "https://raw.githubusercontent.com/taimoorahmed91/iseflowproject/{COMMIT_HASH}/configs/processed_data.json"
}
```

**Example with curl**:
```bash
curl -X POST http://localhost:3000/api/load \
  -H "Authorization: Basic dGFpbW9vcjp0ZW1wLXBhc3N3b3JkLTEyMw==" \
  -H "Content-Type: application/json" \
  -d '{"dataUrl": "https://raw.githubusercontent.com/taimoorahmed91/iseflowproject/abc123/configs/processed_data.json"}'
```

**Example with Python**:
```python
import requests
import base64

API_URL = "http://localhost:3000/api/load"
USERNAME = "taimoor"
PASSWORD = "temp-password-123"
DATA_URL = "https://raw.githubusercontent.com/taimoorahmed91/iseflowproject/abc123/configs/processed_data.json"

credentials = f"{USERNAME}:{PASSWORD}"
encoded = base64.b64encode(credentials.encode()).decode()

response = requests.post(
    API_URL,
    json={"dataUrl": DATA_URL},
    headers={"Authorization": f"Basic {encoded}"}
)

print(response.json())
```

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `BASIC_AUTH_USERNAME`
   - `BASIC_AUTH_PASSWORD`
4. Deploy

## Project Structure

```
/app
  /api
    /load          # API endpoint for data loading
    /events        # SSE endpoint for real-time updates
  page.tsx         # Main page (state router)
  layout.tsx       # Root layout with DataProvider
  globals.css      # Global styles

/components
  IdleState.tsx    # Waiting for data message
  LoadingState.tsx # Loading spinner
  ErrorState.tsx   # Error display
  PolicySetList.tsx # List of policy sets

/lib
  types.ts         # TypeScript type definitions
  DataContext.tsx  # React Context for state management
  validators.ts    # URL and auth validation
  eventEmitter.ts  # SSE event broadcaster
```

## Development Phases

### ✅ Phase 1: API & Real-time (Completed)
- Next.js project setup
- API endpoint with Basic Auth
- SSE implementation
- Idle/Loading states

### 🚧 Phase 2: Data Display (Next)
- Policy set list view
- Error handling improvements
- UI polish

### 📋 Phase 3: Flowchart Visualization (Upcoming)
- React Flow integration
- Node/edge generation
- Diagonal layout algorithm
- Basic styling

### 📋 Phase 4: Interactivity (Upcoming)
- Click handlers
- Detail sidebar
- Condition formatting
- Profile detail lookups

## Documentation

- `DEVELOPER_INSTRUCTIONS.md` - Complete development guide
- `API_SPEC.md` - API endpoint specifications
- `DATA_STRUCTURE.md` - JSON data format documentation
- `FLOWCHART_LAYOUT.md` - Flowchart layout algorithm (pending)

## License

Private project for Taimoor Ahmed

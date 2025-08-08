# Business Assets Platform

A professional React SPA for displaying interactive business intelligence tools including ICP analysis, cost calculators, and business case builders.

## Features

- **ICP Identification & Rating System**: Analyze and rate potential customers against ideal customer profiles
- **Cost of Inaction Calculator**: Calculate financial impact of delayed decisions with interactive charts
- **Business Case Builder**: Create compelling pilot-to-contract business cases with templates

## Tech Stack

- React 18 with functional components and hooks
- React Router v6 for client-side routing
- Tailwind CSS for professional B2B design
- Recharts for data visualizations
- Airtable integration for content management
- Netlify deployment ready

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Airtable account with configured base

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd assets-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Airtable credentials:
```
REACT_APP_AIRTABLE_BASE_ID=your_base_id_here
REACT_APP_AIRTABLE_API_KEY=your_api_key_here
REACT_APP_APP_NAME=Business Assets Platform
```

4. Start the development server:
```bash
npm start
```

## Usage

Access the application using the customer-specific URL pattern:
```
https://your-domain.com/customer/[customerId]?token=[accessToken]
```

### URL Structure

- `/customer/:customerId` - Customer-specific dashboard
- Query parameter `token` - Access token for authentication
- Automatic redirect to first tool (ICP Analysis)

### Navigation

The application provides tab-based navigation between three tools:
- **ICP Analysis** - Company fit scoring and analysis
- **Cost Calculator** - Financial impact calculations with charts
- **Business Case** - Template-based business case generation

## Development

### Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Navigation, Layout
│   ├── tools/           # Main business tools
│   └── common/          # Reusable components
├── services/            # API and authentication services
├── utils/               # Utility functions
└── styles/              # Global styles and Tailwind config
```

### Key Components

- **Layout**: Handles authentication and provides app structure
- **ICPDisplay**: Interactive customer profile analysis tool
- **CostCalculator**: Financial impact calculator with visualizations
- **BusinessCaseBuilder**: Template-based document builder

### Services

- **airtableService**: Handles all Airtable API interactions
- **authService**: Manages customer authentication and sessions

## Deployment

### Netlify Deployment

1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy with build command: `npm run build`

### Environment Variables

Set these in your deployment environment:
- `REACT_APP_AIRTABLE_BASE_ID`
- `REACT_APP_AIRTABLE_API_KEY`
- `REACT_APP_APP_NAME`

## Airtable Configuration

### Required Tables

1. **Customer Assets**
   - Customer ID (text)
   - Customer Name (text)
   - Access Token (text)
   - ICP Content (long text/JSON)
   - Cost Calculator Content (long text/JSON)
   - Business Case Content (long text/JSON)
   - Created At (date)
   - Last Accessed (date)

2. **User Progress** (optional)
   - Customer ID (text)
   - Tool Name (text)
   - Progress Data (long text/JSON)
   - Updated At (date)

### Content Format

Content fields should contain JSON with this structure:
```json
{
  "html": "Rich formatted content",
  "sections": {
    "section_name": "HTML content for expandable sections"
  }
}
```

## Security

- Customer ID and access token authentication
- Session-based authentication with expiration
- CORS protection for API calls
- Content Security Policy headers
- Input validation and sanitization

## Performance

- Code splitting with React.lazy (ready for implementation)
- Optimized bundle size with tree shaking
- Image optimization and lazy loading ready
- Caching headers for static assets
- Service worker ready for offline functionality

## License

Private - All rights reserved
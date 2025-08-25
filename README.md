# Live Cricket Auction System

A real-time cricket player auction system built with Next.js, Supabase, and TypeScript.

## Features

- **Real-time Updates**: Live auction updates using Supabase Realtime
- **Authentication**: Phone number + OTP authentication
- **Role-based Access**: Admin and viewer roles with different permissions
- **Mobile-first Design**: Optimized for mobile viewing experience
- **Admin Dashboard**: Comprehensive admin interface for auction management
- **Security**: Input validation, rate limiting, and audit logging
- **Database**: PostgreSQL with atomic transactions and RLS policies

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Validation**: Zod for schema validation
- **UI Components**: Custom components with shadcn/ui
- **Testing**: Jest + React Testing Library

## Getting Started

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd cricket-auction
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL scripts in the `scripts/` folder in order
   - Enable Realtime for the tables

4. **Environment Variables**
   \`\`\`bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   \`\`\`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## Database Schema

- **teams**: Team information and budgets
- **users**: User authentication and roles
- **players**: Player information and status
- **assignments**: Player-team assignments
- **ledger**: Financial transaction records
- **audit_log**: System audit trail

## Security Features

- Input validation and sanitization
- Rate limiting for authentication
- Row Level Security (RLS) policies
- Audit logging for all operations
- Error boundaries and proper error handling
- CSRF protection and security headers

## API Endpoints

- `GET /api/health` - Health check endpoint
- Authentication handled by Supabase Auth
- Database operations through Supabase client

## Testing

\`\`\`bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
\`\`\`

## Deployment

The application is designed to be deployed on Vercel with Supabase as the backend.

1. Connect your repository to Vercel
2. Add environment variables
3. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

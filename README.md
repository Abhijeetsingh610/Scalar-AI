# NeuroPulse - AI-Powered Business Strategy Platform

A complete Next.js application with Supabase authentication, Groq AI integration, and a modern UI built with Tailwind CSS and shadcn/ui components.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- A Groq API key

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Groq AI Configuration
GROQ_API_KEY=your_groq_api_key
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL commands from `database-schema.sql`

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
neuropulse/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── leads/         # Lead management endpoint
│   │   └── llm/           # AI integration endpoints
│   ├── dashboard/         # User dashboard
│   ├── signup/           # User registration
│   ├── admin/            # Admin panel
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── auth-provider.tsx # Authentication wrapper
│   ├── lead-form.tsx     # Lead capture form
│   └── theme-toggle.tsx  # Dark/light mode toggle
├── lib/                  # Utility functions
│   ├── utils.ts          # Class name utilities
│   ├── supabase-admin.ts # Admin Supabase client
│   └── supabase-client.ts # Client Supabase client
└── database-schema.sql   # Database setup script
```

## 🎨 Features

### Core Features
- **Landing Page**: Hero section with lead capture form
- **AI Personalization**: Groq-powered business plan generation
- **User Authentication**: Supabase email OTP authentication
- **Dashboard**: Personalized business plans and action items
- **Admin Panel**: Lead management and AI regeneration
- **Responsive Design**: Mobile-first approach

### Technical Features
- **Next.js 14+**: App Router with TypeScript
- **Supabase**: Authentication and PostgreSQL database
- **Groq AI**: LLM integration for personalization
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality component library
- **Framer Motion**: Smooth animations
- **Dark/Light Mode**: System-aware theme switching

## 🔧 API Endpoints

### `/api/leads` (POST)
Creates a new lead and triggers AI personalization.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "goal": "Launch a SaaS product",
  "domain": "Technology"
}
```

### `/api/llm/personalize` (POST)
Generates personalized business plan using Groq AI.

**Request:**
```json
{
  "name": "John Doe",
  "goal": "Launch a SaaS product",
  "domain": "Technology"
}
```

### `/api/llm/bookingsuggest` (POST)
Returns AI-suggested booking time slots.

**Request:**
```json
{
  "timezone": "America/New_York"
}
```

## 🗄️ Database Schema

The application uses a single `leads` table with the following structure:

- `id`: UUID primary key
- `name`: User's full name
- `email`: User's email address
- `goal`: Business goal/objective
- `domain`: Industry/business domain
- `personalized_plan`: AI-generated business plan
- `nurture_sequence`: Array of action items
- `created_at`: Timestamp
- `updated_at`: Timestamp

## 🔐 Authentication Flow

1. User enters email on signup page
2. Supabase sends OTP to email
3. User verifies with 6-digit code
4. Access granted to dashboard and admin panel

## 🎯 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `GROQ_API_KEY` | Groq API key for LLM | Yes |

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application works on any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## 🔍 Development Notes

- All components use TypeScript strict mode
- ESLint configured for Next.js best practices
- Responsive design with mobile-first approach
- Accessible components with ARIA labels
- Error boundaries and loading states
- Optimistic UI updates where appropriate

## 📝 Customization

### Styling
- Modify `app/globals.css` for global styles
- Update `tailwind.config.js` for theme customization
- Edit component classes for specific changes

### AI Prompts
- Customize prompts in `/api/llm/personalize/route.ts`
- Adjust model parameters (temperature, max_tokens)
- Implement different AI providers if needed

### Database
- Extend the `leads` table schema as needed
- Add new tables for additional features
- Implement database migrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

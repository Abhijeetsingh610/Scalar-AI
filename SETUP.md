# 🚀 NeuroPulse Setup Instructions

Follow these steps to get NeuroPulse running locally:

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment Variables

Copy the example environment file:

```bash
copy .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
GROQ_API_KEY=your_groq_api_key_here
```

## 3. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and run the SQL from `database-schema.sql`

## 4. Get Your API Keys

### Supabase Keys
1. Go to your Supabase project settings
2. Navigate to API section
3. Copy the Project URL and anon/service_role keys

### Groq API Key
1. Sign up at https://console.groq.com/
2. Create a new API key
3. Copy the key to your .env.local

## 5. Run the Application

```bash
npm run dev
```

Visit http://localhost:3000 to see your application!

## 🎯 Testing the Application

1. **Landing Page**: Fill out the lead form
2. **Sign Up**: Create an account with email OTP
3. **Dashboard**: View your personalized business plan
4. **Admin Panel**: Manage leads and regenerate AI content

## 🔧 Troubleshooting

### Common Issues

**Build Errors**: Make sure all dependencies are installed
**Database Errors**: Verify Supabase connection and schema
**AI Errors**: Check Groq API key and rate limits
**Auth Errors**: Verify Supabase auth configuration

### Need Help?

Check the full README.md for detailed documentation and troubleshooting guides.

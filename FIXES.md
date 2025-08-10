# 🔧 Database Setup & Fixes

## Step 1: Update Your Service Role Key

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/pmfpiliekzujamlrcvkp
2. Go to Settings → API
3. Copy the `service_role` key (not the anon key)
4. Update your `.env.local` file with the real service role key

## Step 2: Run Database Schema Update

Go to your Supabase project → SQL Editor and run this command to fix the unique constraint issue:

```sql
-- Add unique constraint to email column if it doesn't exist
ALTER TABLE leads ADD CONSTRAINT leads_email_unique UNIQUE (email);
```

If the table doesn't exist yet, run the complete schema from `database-schema.sql`.

## Step 3: Configure Supabase Auth Settings

1. Go to Authentication → Settings in your Supabase dashboard
2. Set the Site URL to: `http://localhost:3000`
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`
4. Enable "Confirm email" under Email settings

## Step 4: Test the Application

1. Restart your Next.js server: `npm run dev`
2. Go to `/signup` and enter an email
3. Check your email for the magic link
4. Click the link to be redirected to the dashboard

## Troubleshooting

- **No email received**: Check Supabase auth settings and spam folder
- **Database errors**: Ensure service role key is correct and schema is applied
- **Auth errors**: Verify redirect URLs in Supabase dashboard

The magic link approach is more reliable than OTP for development.

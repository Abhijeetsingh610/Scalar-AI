'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { Brain, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      // Try signing up first, then sign in
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: 'temp-password-will-be-reset', // Temporary password
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (signUpError && !signUpError.message.includes('already registered')) {
        setError(signUpError.message)
      } else {
        // If user exists or was created, send magic link
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        })

        if (error) {
          setError(error.message)
        } else {
          setIsOtpSent(true)
          setSuccess('Check your email for the magic link to sign in!')
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Account verified! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (err) {
      setError('Invalid verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">NeuroPulse</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Sign Up Form */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  {isOtpSent ? (
                    <Mail className="w-6 h-6 text-primary" />
                  ) : (
                    <Brain className="w-6 h-6 text-primary" />
                  )}
                </div>
                <CardTitle className="text-2xl">
                  {isOtpSent ? 'Check Your Email' : 'Create Your Account'}
                </CardTitle>
                <CardDescription>
                  {isOtpSent 
                    ? 'Click the magic link we sent to your email to sign in'
                    : 'Join NeuroPulse to access your personalized business dashboard'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isOtpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        disabled={isLoading}
                        className={error ? 'border-red-500' : ''}
                      />
                    </div>

                    {error && (
                      <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-md flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {success}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Sending Magic Link...
                        </>
                      ) : (
                        'Send Magic Link'
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                      Magic link sent! Check your email and click the link to sign in.
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsOtpSent(false)
                        setError('')
                        setSuccess('')
                      }}
                    >
                      Send to Different Email
                    </Button>
                  </div>
                )}

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/dashboard" className="text-primary hover:underline">
                    Sign In
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

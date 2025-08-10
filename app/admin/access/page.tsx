'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function AdminAccessPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setLoading(false)
          return
        }

        setUser(user)
        
        // Check if user is admin
        if (user.email === 'abhijeet610singh@gmail.com') {
          setIsAdmin(true)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error checking admin access:', error)
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
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
            <span className="text-xl font-bold">ScalerAI Admin Access</span>
          </Link>
          
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Admin Access Portal</CardTitle>
              <CardDescription>
                Administrative access control and debugging information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Status */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Current User Status</h3>
                
                {!user ? (
                  <div className="flex items-center space-x-2 text-amber-600">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Not logged in</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Logged in as: {user.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>User ID: {user.id}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        isAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        Admin Status: {isAdmin ? 'ADMIN USER' : 'REGULAR USER'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Actions */}
              {isAdmin ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-green-600">Admin Access Granted</h3>
                  <p className="text-muted-foreground">
                    You have administrative privileges. Choose your action:
                  </p>
                  
                  <div className="grid gap-3">
                    <Button 
                      onClick={() => router.push('/admin/analytics')}
                      className="w-full justify-start"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Access Admin Analytics Dashboard
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/admin/login')}
                      className="w-full justify-start"
                    >
                      Admin Login Page
                    </Button>
                  </div>
                </div>
              ) : user ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-amber-600">Access Denied</h3>
                  <p className="text-muted-foreground">
                    Your account ({user.email}) does not have administrative privileges.
                    Only the admin account (abhijeet610singh@gmail.com) can access the admin dashboard.
                  </p>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                      className="w-full"
                    >
                      Return to User Dashboard
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-amber-600">Authentication Required</h3>
                  <p className="text-muted-foreground">
                    Please log in to check your administrative access.
                  </p>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={() => router.push('/signin')}
                      className="w-full"
                    >
                      Sign In
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/admin/login')}
                      className="w-full"
                    >
                      Admin Login
                    </Button>
                  </div>
                </div>
              )}

              {/* Debug Info */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Debug Information</h3>
                <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                  <div>Expected admin email: abhijeet610singh@gmail.com</div>
                  <div>Current email: {user?.email || 'Not logged in'}</div>
                  <div>Email match: {user?.email === 'abhijeet610singh@gmail.com' ? 'YES' : 'NO'}</div>
                  <div>Timestamp: {new Date().toISOString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

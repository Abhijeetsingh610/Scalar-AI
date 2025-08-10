'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Brain, Settings, Users, RefreshCw, ArrowLeft, Trash2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'

interface User {
  id: string
  email?: string
}

interface Lead {
  id: string
  name: string
  email: string
  goal: string
  domain: string
  personalized_plan?: string
  nurture_sequence?: string[]
  created_at: string
}

interface AdminEvent {
  id: string
  type: string
  description: string
  timestamp: string
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRegeneratingPlan, setIsRegeneratingPlan] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/signup')
        return
      }

      setUser(user)
      await fetchAllLeads()
      setIsLoading(false)
    }

    getUser()
  }, [supabase, router])

  const fetchAllLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching leads:', error)
      } else {
        setLeads(data || [])
        
        // Generate mock events for demo
        const mockEvents: AdminEvent[] = (data || []).map((lead, index) => ({
          id: `event-${index}`,
          type: 'Lead Generated',
          description: `New lead: ${lead.name} (${lead.email}) for ${lead.goal}`,
          timestamp: lead.created_at
        }))
        
        setEvents(mockEvents)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    }
  }

  const regeneratePersonalization = async (leadId: string, leadData: Lead) => {
    setIsRegeneratingPlan(leadId)
    
    try {
      const response = await fetch('/api/llm/personalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: leadData.name,
          email: leadData.email,
          goal: leadData.goal,
          domain: leadData.domain,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.success) {
          // Update the lead in Supabase
          const { error } = await supabase
            .from('leads')
            .update({
              personalized_plan: result.data?.plan,
              nurture_sequence: result.data?.sequence,
            })
            .eq('id', leadId)

          if (!error) {
            // Refresh leads
            await fetchAllLeads()
          }
        }
      }
    } catch (error) {
      console.error('Error regenerating personalization:', error)
    } finally {
      setIsRegeneratingPlan(null)
    }
  }

  const deleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return
    
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)

      if (!error) {
        await fetchAllLeads()
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Admin Panel</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage leads, monitor system events, and regenerate AI personalizations
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leads.length}</div>
                <p className="text-xs text-muted-foreground">
                  All time registrations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processed Plans</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {leads.filter(l => l.personalized_plan).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Plans with AI analysis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
                <p className="text-xs text-muted-foreground">
                  System events logged
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Leads Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  Leads Management
                </CardTitle>
                <CardDescription>
                  View and manage all leads in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {leads.length > 0 ? (
                    leads.map((lead) => (
                      <div key={lead.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{lead.name}</h4>
                            <p className="text-sm text-muted-foreground">{lead.email}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => regeneratePersonalization(lead.id, lead)}
                              disabled={isRegeneratingPlan === lead.id}
                            >
                              {isRegeneratingPlan === lead.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Play className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteLead(lead.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Goal:</span> {lead.goal}</p>
                          <p><span className="font-medium">Domain:</span> {lead.domain}</p>
                          <p><span className="font-medium">Status:</span> 
                            <span className={`ml-1 ${lead.personalized_plan ? 'text-green-600' : 'text-yellow-600'}`}>
                              {lead.personalized_plan ? 'Processed' : 'Pending'}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No leads found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RefreshCw className="w-5 h-5 mr-2 text-primary" />
                  System Events
                </CardTitle>
                <CardDescription>
                  Recent system activity and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {events.length > 0 ? (
                    events.map((event) => (
                      <div key={event.id} className="border-l-2 border-primary/20 pl-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{event.type}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No events found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

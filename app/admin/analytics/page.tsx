'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  Users, 
  GraduationCap, 
  Calendar,
  Target,
  Award,
  LogOut,
  Shield,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

interface AnalyticsData {
  totalLeads: number
  masterclassRegistrations: number
  courseEnrollments: number
  consultationBookings: number
  conversionRates: {
    leadToMasterclass: number
    masterclassToCourse: number
    courseToConsultation: number
    overallConversion: number
  }
  topTechStacks: Array<{ name: string; count: number }>
  experienceLevels: Array<{ level: string; count: number }>
  recentActivity: Array<{
    type: 'lead' | 'registration' | 'enrollment' | 'booking'
    name: string
    timestamp: string
    details: string
  }>
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || user.email !== 'abhijeet610singh@gmail.com') {
        router.push('/admin/login')
        return
      }

      setIsAdmin(true)
      await fetchAnalytics()
    }

    checkAdminAccess()
  }, [supabase, router])

  const fetchAnalytics = async () => {
    try {
      // Fetch leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')

      // Fetch masterclass registrations
      const { data: registrations, error: regError } = await supabase
        .from('masterclass_registrations')
        .select('*, leads(name)')

      // Fetch course enrollments
      const { data: enrollments, error: enrollError } = await supabase
        .from('course_enrollments')
        .select('*, leads(name)')

      // Fetch consultation bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('consultation_bookings')
        .select('*, leads(name)')

      if (leadsError || regError || enrollError || bookingsError) {
        console.error('Error fetching analytics:', { leadsError, regError, enrollError, bookingsError })
        return
      }

      // Process the data
      const totalLeads = leads?.length || 0
      const masterclassRegistrations = registrations?.length || 0
      const courseEnrollments = enrollments?.length || 0
      const consultationBookings = bookings?.length || 0

      // Calculate conversion rates
      const leadToMasterclass = totalLeads > 0 ? (masterclassRegistrations / totalLeads) * 100 : 0
      const masterclassToCourse = masterclassRegistrations > 0 ? (courseEnrollments / masterclassRegistrations) * 100 : 0
      const courseToConsultation = courseEnrollments > 0 ? (consultationBookings / courseEnrollments) * 100 : 0
      const overallConversion = totalLeads > 0 ? (consultationBookings / totalLeads) * 100 : 0

      // Process tech stacks
      const techStackCounts: { [key: string]: number } = {}
      leads?.forEach(lead => {
        if (lead.preferred_tech_stack) {
          lead.preferred_tech_stack.forEach((tech: string) => {
            techStackCounts[tech] = (techStackCounts[tech] || 0) + 1
          })
        }
      })

      const topTechStacks = Object.entries(techStackCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Process experience levels
      const experienceCounts: { [key: string]: number } = {}
      leads?.forEach(lead => {
        if (lead.experience_level) {
          experienceCounts[lead.experience_level] = (experienceCounts[lead.experience_level] || 0) + 1
        }
      })

      const experienceLevels = Object.entries(experienceCounts)
        .map(([level, count]) => ({ level, count }))
        .sort((a, b) => b.count - a.count)

      // Recent activity (last 10 activities)
      const recentActivity: any[] = []
      
      // Add recent leads
      leads?.slice(-5).forEach(lead => {
        recentActivity.push({
          type: 'lead',
          name: lead.name,
          timestamp: lead.created_at,
          details: `New lead: ${lead.job_role}`
        })
      })

      // Add recent registrations
      registrations?.slice(-3).forEach(reg => {
        recentActivity.push({
          type: 'registration',
          name: reg.leads?.name || 'Unknown',
          timestamp: reg.created_at,
          details: 'Registered for masterclass'
        })
      })

      // Add recent enrollments
      enrollments?.slice(-2).forEach(enrollment => {
        recentActivity.push({
          type: 'enrollment',
          name: enrollment.leads?.name || 'Unknown',
          timestamp: enrollment.created_at,
          details: 'Enrolled in course'
        })
      })

      // Sort by timestamp
      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setAnalytics({
        totalLeads,
        masterclassRegistrations,
        courseEnrollments,
        consultationBookings,
        conversionRates: {
          leadToMasterclass,
          masterclassToCourse,
          courseToConsultation,
          overallConversion
        },
        topTechStacks,
        experienceLevels,
        recentActivity: recentActivity.slice(0, 10)
      })

    } catch (error) {
      console.error('Error processing analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Loading Admin Dashboard...</h1>
          <p className="text-muted-foreground">Verifying credentials and fetching analytics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold">NeuroPulse Admin</span>
              <Badge variant="secondary" className="ml-2">Analytics Dashboard</Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Admin Access</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into lead conversion and user engagement
          </p>
        </motion.div>

        {analytics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalLeads}</div>
                    <p className="text-xs text-muted-foreground">
                      Active prospects in funnel
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Masterclass Registrations</CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.masterclassRegistrations}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.conversionRates.leadToMasterclass.toFixed(1)}% conversion from leads
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Course Enrollments</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.courseEnrollments}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.conversionRates.masterclassToCourse.toFixed(1)}% from masterclasses
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Consultation Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.consultationBookings}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.conversionRates.overallConversion.toFixed(1)}% overall conversion
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Conversion Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Conversion Funnel</span>
                    </CardTitle>
                    <CardDescription>Lead progression through the funnel</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Leads → Masterclasses</span>
                        <span>{analytics.conversionRates.leadToMasterclass.toFixed(1)}%</span>
                      </div>
                      <Progress value={analytics.conversionRates.leadToMasterclass} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Masterclasses → Courses</span>
                        <span>{analytics.conversionRates.masterclassToCourse.toFixed(1)}%</span>
                      </div>
                      <Progress value={analytics.conversionRates.masterclassToCourse} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Courses → Consultations</span>
                        <span>{analytics.conversionRates.courseToConsultation.toFixed(1)}%</span>
                      </div>
                      <Progress value={analytics.conversionRates.courseToConsultation} className="h-2" />
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-sm font-medium mb-2">
                        <span>Overall Conversion</span>
                        <span className="text-primary">{analytics.conversionRates.overallConversion.toFixed(1)}%</span>
                      </div>
                      <Progress value={analytics.conversionRates.overallConversion} className="h-3" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="w-5 h-5" />
                      <span>Top Tech Stacks</span>
                    </CardTitle>
                    <CardDescription>Most popular technologies among leads</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.topTechStacks.map((tech, index) => (
                        <div key={tech.name} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{tech.name}</span>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={(tech.count / analytics.totalLeads) * 100} 
                              className="w-20 h-2"
                            />
                            <span className="text-sm text-muted-foreground w-8">{tech.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Experience Levels & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Experience Levels</span>
                    </CardTitle>
                    <CardDescription>Distribution of lead experience levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.experienceLevels.map((level) => (
                        <div key={level.level} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{level.level}</span>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={(level.count / analytics.totalLeads) * 100} 
                              className="w-20 h-2"
                            />
                            <span className="text-sm text-muted-foreground w-8">{level.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Eye className="w-5 h-5" />
                      <span>Recent Activity</span>
                    </CardTitle>
                    <CardDescription>Latest user interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            activity.type === 'lead' ? 'bg-blue-500' :
                            activity.type === 'registration' ? 'bg-green-500' :
                            activity.type === 'enrollment' ? 'bg-purple-500' :
                            'bg-orange-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{activity.name}</p>
                            <p className="text-xs text-muted-foreground">{activity.details}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

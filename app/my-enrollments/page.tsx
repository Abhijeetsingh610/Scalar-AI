'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  CheckCircle, 
  ArrowRight,
  BookOpen,
  Video,
  User,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface EnrolledMasterclass {
  id: string
  title: string
  description: string
  instructor_name: string
  instructor_title: string
  tech_stack: string[]
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced'
  scheduled_date: string
  duration_minutes: number
  current_attendees: number
  rating: number
  is_free: boolean
  registration: {
    id: string
    registered_at: string
    attended: boolean
    engagement_score: number
  }
}

export default function MyEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrolledMasterclass[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadEnrollments()
  }, [])

  const loadEnrollments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.email) {
        setLoading(false)
        return
      }

      // Find lead record
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('id')
        .eq('email', user.email)
        .single()

      if (leadError || !leadData) {
        setLoading(false)
        return
      }

      // Get all enrollments with masterclass details
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('masterclass_registrations')
        .select(`
          id,
          registered_at,
          attended,
          engagement_score,
          masterclasses (
            id,
            title,
            description,
            instructor_name,
            instructor_title,
            tech_stack,
            difficulty_level,
            scheduled_date,
            duration_minutes,
            current_attendees,
            rating,
            is_free
          )
        `)
        .eq('lead_id', leadData.id)
        .order('registered_at', { ascending: false })

      if (enrollmentError) {
        console.error('Error loading enrollments:', enrollmentError)
        setLoading(false)
        return
      }

      // Transform the data
      const transformedEnrollments: EnrolledMasterclass[] = enrollmentData?.map((enrollment: any) => ({
        id: enrollment.masterclasses.id,
        title: enrollment.masterclasses.title,
        description: enrollment.masterclasses.description,
        instructor_name: enrollment.masterclasses.instructor_name,
        instructor_title: enrollment.masterclasses.instructor_title,
        tech_stack: enrollment.masterclasses.tech_stack,
        difficulty_level: enrollment.masterclasses.difficulty_level,
        scheduled_date: enrollment.masterclasses.scheduled_date,
        duration_minutes: enrollment.masterclasses.duration_minutes,
        current_attendees: enrollment.masterclasses.current_attendees,
        rating: enrollment.masterclasses.rating,
        is_free: enrollment.masterclasses.is_free,
        registration: {
          id: enrollment.id,
          registered_at: enrollment.registered_at,
          attended: enrollment.attended,
          engagement_score: enrollment.engagement_score
        }
      })) || []

      setEnrollments(transformedEnrollments)
    } catch (error) {
      console.error('Error loading enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusInfo = (masterclass: EnrolledMasterclass) => {
    const now = new Date()
    const scheduledDate = new Date(masterclass.scheduled_date)
    const isPast = scheduledDate < now
    const isUpcoming = scheduledDate > now && (scheduledDate.getTime() - now.getTime()) < 24 * 60 * 60 * 1000 // within 24 hours

    if (isPast) {
      return {
        status: masterclass.registration.attended ? 'completed' : 'missed',
        label: masterclass.registration.attended ? 'Completed' : 'Missed',
        color: masterclass.registration.attended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }
    } else if (isUpcoming) {
      return {
        status: 'upcoming',
        label: 'Starting Soon',
        color: 'bg-orange-100 text-orange-800'
      }
    } else {
      return {
        status: 'scheduled',
        label: 'Scheduled',
        color: 'bg-blue-100 text-blue-800'
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your enrollments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 dark:from-blue-950 dark:via-purple-950 dark:to-cyan-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            My Enrollments
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your learning journey and access your enrolled masterclasses
          </p>
        </motion.div>

        {enrollments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-4">No Enrollments Yet</h2>
            <p className="text-muted-foreground mb-8">
              Start your learning journey by enrolling in a masterclass
            </p>
            <Button asChild>
              <Link href="/masterclasses">
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Masterclasses
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {enrollments.map((masterclass, index) => {
              const statusInfo = getStatusInfo(masterclass)
              
              return (
                <motion.div
                  key={masterclass.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getDifficultyColor(masterclass.difficulty_level)}>
                              {masterclass.difficulty_level}
                            </Badge>
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                            {masterclass.is_free && (
                              <Badge className="bg-green-100 text-green-800">FREE</Badge>
                            )}
                          </div>
                          
                          <CardTitle className="text-xl mb-2">{masterclass.title}</CardTitle>
                          <CardDescription className="text-base mb-4">
                            {masterclass.description}
                          </CardDescription>
                          
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(masterclass.scheduled_date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {masterclass.duration_minutes} mins
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {masterclass.current_attendees} enrolled
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              {masterclass.rating.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">Enrolled on</p>
                          <p className="font-medium">
                            {new Date(masterclass.registration.registered_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{masterclass.instructor_name}</p>
                            <p className="text-xs text-muted-foreground">{masterclass.instructor_title}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {statusInfo.status === 'upcoming' && (
                            <Button size="sm" onClick={() => alert('Join link will be available 15 minutes before start!')}>
                              <Video className="w-4 h-4 mr-2" />
                              Join Soon
                            </Button>
                          )}
                          
                          {statusInfo.status === 'completed' && (
                            <Button size="sm" variant="outline" onClick={() => alert('Resources available!')}>
                              <Award className="w-4 h-4 mr-2" />
                              View Resources
                            </Button>
                          )}
                          
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/masterclasses/${masterclass.id}`}>
                              View Details
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                      
                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-1 mt-4">
                        {masterclass.tech_stack.slice(0, 4).map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {masterclass.tech_stack.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{masterclass.tech_stack.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Stats Section */}
        {enrollments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <Card>
              <CardHeader>
                <CardTitle>Your Learning Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {enrollments.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Enrollments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {enrollments.filter(e => e.registration.attended).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {enrollments.filter(e => new Date(e.scheduled_date) > new Date()).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Upcoming</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {Math.round(enrollments.reduce((sum, e) => sum + e.registration.engagement_score, 0) / enrollments.length) || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Engagement</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

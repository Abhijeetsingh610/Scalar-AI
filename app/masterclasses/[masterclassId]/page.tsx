'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Star, 
  Play, 
  CheckCircle, 
  Award,
  BookOpen,
  Calendar,
  MapPin,
  User,
  Video,
  Download,
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

interface Masterclass {
  id: string
  title: string
  description: string
  instructor_name: string
  instructor_title: string
  tech_stack: string[]
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced'
  scheduled_date: string
  duration_minutes: number
  max_attendees: number
  current_attendees: number
  rating: number
  price: number
  is_free: boolean
  tags: string[]
}

interface Registration {
  id: string
  registered_at: string
  attended: boolean
  engagement_score: number
}

export default function MasterclassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [masterclass, setMasterclass] = useState<Masterclass | null>(null)
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  const masterclassId = params.masterclassId as string

  useEffect(() => {
    loadMasterclass()
  }, [masterclassId])

  const loadMasterclass = async () => {
    try {
      // Load masterclass details
      const { data: masterclassData, error: masterclassError } = await supabase
        .from('masterclasses')
        .select('*')
        .eq('id', masterclassId)
        .single()

      if (masterclassError || !masterclassData) {
        console.error('Error loading masterclass:', masterclassError)
        router.push('/masterclasses')
        return
      }

      setMasterclass(masterclassData)

      // Check if user is enrolled
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        // Find lead record
        const { data: leadData } = await supabase
          .from('leads')
          .select('id')
          .eq('email', user.email)
          .single()

        if (leadData) {
          // Check registration
          const { data: registrationData } = await supabase
            .from('masterclass_registrations')
            .select('*')
            .eq('masterclass_id', masterclassId)
            .eq('lead_id', leadData.id)
            .single()

          setRegistration(registrationData)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading masterclass...</p>
        </div>
      </div>
    )
  }

  if (!masterclass) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Masterclass Not Found</h1>
          <p className="text-muted-foreground mb-6">The masterclass you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/masterclasses">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Masterclasses
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 dark:from-blue-950 dark:via-purple-950 dark:to-cyan-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link href="/masterclasses">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Masterclasses
              </Link>
            </Button>
            
            {registration && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <CheckCircle className="w-4 h-4 mr-1" />
                Enrolled
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge className={getDifficultyColor(masterclass.difficulty_level)}>
              {masterclass.difficulty_level}
            </Badge>
            {masterclass.is_free && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                FREE
              </Badge>
            )}
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {masterclass.title}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {masterclass.description}
          </p>

          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">{formatDate(masterclass.scheduled_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span>{masterclass.duration_minutes} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span>{masterclass.current_attendees} enrolled</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span>{masterclass.rating.toFixed(1)} rating</span>
            </div>
          </div>

          {registration && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-2xl p-8 max-w-lg mx-auto shadow-lg border border-green-200 dark:border-green-800">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                  You're Enrolled! 🎉
                </h3>
                
                <p className="text-green-700 dark:text-green-300 mb-6">
                  Enrolled on {new Date(registration.registered_at).toLocaleDateString()}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Button 
                    variant="outline"
                    className="bg-white/50"
                    onClick={() => {
                      // Add to calendar logic
                      alert('Calendar invite feature coming soon!')
                    }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="bg-white/50"
                    onClick={() => {
                      // Join meeting logic
                      alert('Join link will be available 15 minutes before the masterclass starts!')
                    }}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Meeting
                  </Button>
                </div>
                
                <div className="text-sm text-green-700 dark:text-green-300">
                  <p>📧 Check your email for joining instructions</p>
                  <p>🔗 Meeting link will be available 15 minutes before start time</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Content Tabs */}
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Technologies */}
              <Card>
                <CardHeader>
                  <CardTitle>Technologies Covered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {masterclass.tech_stack.map((tech, index) => (
                      <Badge key={index} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* What You'll Learn */}
              <Card>
                <CardHeader>
                  <CardTitle>What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Practical hands-on experience with industry-standard tools</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Best practices from experienced professionals</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Career guidance and industry insights</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Q&A session with the instructor</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Access to exclusive resources and materials</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructor">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{masterclass.instructor_name}</h3>
                    <p className="text-muted-foreground mb-4">{masterclass.instructor_title}</p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Experienced professional with years of hands-on experience in the industry. 
                      Passionate about sharing knowledge and helping others grow in their careers.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <h4 className="font-semibold">Expert Teacher</h4>
                        <p className="text-sm text-muted-foreground">Industry experience</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Award className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <h4 className="font-semibold">Proven Track Record</h4>
                        <p className="text-sm text-muted-foreground">Successful students</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="community">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-bold mb-2">Join the Community</h3>
                    <p className="text-muted-foreground mb-6">
                      Connect with {masterclass.current_attendees} other learners, share experiences, and continue learning together.
                    </p>
                    
                    {registration ? (
                      <div className="space-y-4">
                        <Button className="w-full" onClick={() => alert('Community access coming soon!')}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Access Community
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          Available after the masterclass session
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Enroll to access the exclusive community
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

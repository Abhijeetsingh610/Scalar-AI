'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  BookOpen, 
  Calendar, 
  Target, 
  User,
  Award,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import MasterclassCard from '@/components/masterclass-card'
import AIRoadmap from '@/components/ai-roadmap'
import AssessmentPopup from '@/components/assessment-popup'
import UserAssessmentPopup from '@/components/user-assessment-popup'
import Link from 'next/link'

interface AuthUser {
  id: string
  email?: string
}

interface CareerRoadmap {
  currentLevel: string
  nextMilestones: string[]
  recommendedSkills: string[]
  estimatedTimeframe: string
}

interface UserProfile {
  name: string
  currentRole: string
  experienceLevel: string
  careerGoals: string
  preferredTechStack: string[]
  roadmap: CareerRoadmap
}

interface Recommendation {
  id: string
  type: 'masterclass' | 'skill' | 'project'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedTime: string
}

interface Lead {
  id: string
  name: string
  email: string
  job_role: string
  experience_level: string
  career_goals: string
  preferred_tech_stack: string[]
  created_at: string
}

export default function DashboardPage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [roadmapData, setRoadmapData] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [registeredMasterclasses, setRegisteredMasterclasses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // For demo purposes, check localStorage for roadmap data
        const savedRoadmap = localStorage.getItem('userRoadmap')
        if (savedRoadmap) {
          setRoadmapData(JSON.parse(savedRoadmap))
        }
        loadDemoData()
        return
      }

      setAuthUser(user)
      await fetchUserProfile(user.email!)
      
      // Check localStorage for roadmap data
      const savedRoadmap = localStorage.getItem('userRoadmap')
      if (savedRoadmap) {
        setRoadmapData(JSON.parse(savedRoadmap))
      }
      
      setLoading(false)
    }

    getUser()
  }, [supabase, router])

  const loadDemoData = () => {
    // Load demo data when no user is authenticated
    setUserProfile({
      name: 'Alex Chen',
      currentRole: 'Junior Frontend Developer',
      experienceLevel: '0-2 years',
      careerGoals: 'Become a full-stack developer and eventually transition to a tech lead role',
      preferredTechStack: ['JavaScript/React', 'Python', 'Full Stack'],
      roadmap: {
        currentLevel: 'Junior Frontend Developer',
        nextMilestones: [
          'Master advanced React patterns',
          'Learn backend development with Node.js',
          'Build 3 full-stack projects',
          'Get promoted to Mid-level Developer'
        ],
        recommendedSkills: ['Node.js', 'Express.js', 'PostgreSQL', 'REST APIs', 'Authentication'],
        estimatedTimeframe: '8-12 months'
      }
    })

    setRecommendations([
      {
        id: '1',
        type: 'masterclass',
        title: 'Full Stack Development with React & Node.js',
        description: 'Perfect for transitioning from frontend to full-stack development',
        priority: 'high',
        estimatedTime: '2 hours'
      },
      {
        id: '2',
        type: 'skill',
        title: 'Learn PostgreSQL Database Design',
        description: 'Essential database skills for backend development',
        priority: 'high',
        estimatedTime: '3-4 weeks'
      },
      {
        id: '3',
        type: 'project',
        title: 'Build a Task Management App',
        description: 'Apply full-stack skills in a real project',
        priority: 'medium',
        estimatedTime: '4-6 weeks'
      },
      {
        id: '4',
        type: 'masterclass',
        title: 'API Design Best Practices',
        description: 'Learn to design scalable REST APIs',
        priority: 'medium',
        estimatedTime: '90 minutes'
      }
    ])

    setLoading(false)
  }

  const fetchUserProfile = async (email: string) => {
    try {
      // First, try to get profile data
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        // If profile exists, use it for basic info
        if (profile && !profileError) {
          // Also try to get lead data for additional career info
          const { data: leadData, error: leadError } = await supabase
            .from('leads')
            .select('*')
            .eq('email', email)
            .order('created_at', { ascending: false })
            .limit(1)

          const lead = leadData && leadData.length > 0 ? leadData[0] as Lead : null

          setUserProfile({
            name: `${profile.first_name} ${profile.last_name}`.trim() || profile.email,
            currentRole: lead?.job_role || 'Professional',
            experienceLevel: lead?.experience_level || 'Getting Started',
            careerGoals: lead?.career_goals || 'Advance my career in technology',
            preferredTechStack: lead?.preferred_tech_stack || ['JavaScript', 'Python'],
            roadmap: {
              currentLevel: lead?.job_role || 'Professional',
              nextMilestones: [
                'Complete recommended masterclasses',
                'Build portfolio projects',
                'Network with industry professionals',
                'Apply for next level positions'
              ],
              recommendedSkills: ['Advanced JavaScript', 'Cloud Technologies', 'System Design'],
              estimatedTimeframe: '6-12 months'
            }
          })
          
          if (lead) {
            generateRecommendations(lead)
          }
          return
        }
      }

      // Fallback to leads table only
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Error fetching user profile:', error)
        loadDemoData()
        return
      }

      if (data && data.length > 0) {
        const lead = data[0] as Lead
        setUserProfile({
          name: lead.name,
          currentRole: lead.job_role,
          experienceLevel: lead.experience_level,
          careerGoals: lead.career_goals,
          preferredTechStack: lead.preferred_tech_stack || [],
          roadmap: {
            currentLevel: lead.job_role,
            nextMilestones: [
              'Complete recommended masterclasses',
              'Build portfolio projects',
              'Network with industry professionals',
              'Apply for next level positions'
            ],
            recommendedSkills: ['Advanced JavaScript', 'Cloud Technologies', 'System Design'],
            estimatedTimeframe: '6-12 months'
          }
        })

        // Generate AI recommendations based on user profile
        generateRecommendations(lead)
      } else {
        loadDemoData()
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      loadDemoData()
    }
  }

  const generateRecommendations = async (lead: Lead) => {
    try {
      const response = await fetch('/api/llm/personalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentRole: lead.job_role,
          experienceLevel: lead.experience_level,
          careerGoals: lead.career_goals,
          preferredTechStack: lead.preferred_tech_stack
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.data?.recommendations) {
          setRecommendations(data.data.recommendations)
        }
      }
    } catch (error) {
      console.error('Error generating recommendations:', error)
    }
  }

  const handleGenerateCustomCourse = async () => {
    if (!userProfile) {
      alert('Please complete your assessment first to generate a personalized course!')
      return
    }

    console.log('Generating course for user profile:', userProfile)

    try {
      // Generate skill gaps based on user profile and career goals
      const skillGaps = [
        'Advanced Python programming',
        'Deep Learning frameworks',
        'MLOps and deployment',
        'System design for ML',
        'Cloud architecture'
      ]

      console.log('Sending course generation request...')

      const response = await fetch('/api/llm/generate-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile: {
            job_role: userProfile.currentRole,
            experience_level: userProfile.experienceLevel,
            career_goals: userProfile.careerGoals,
            tech_stack: userProfile.preferredTechStack
          },
          skillGaps,
          careerGoals: userProfile.careerGoals
        })
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('Custom course generated successfully:', result)
        
        // Ensure we have the expected structure
        if (!result.customCourse || !result.customCourse.course) {
          throw new Error('Invalid course data structure received from API')
        }
        
        // Add the custom course to roadmap data
        if (roadmapData && roadmapData.roadmap && roadmapData.roadmap.courses) {
          // Update existing roadmap
          const updatedRoadmap = {
            ...roadmapData,
            roadmap: {
              ...roadmapData.roadmap,
              courses: [result.customCourse.course, ...roadmapData.roadmap.courses]
            }
          }
          setRoadmapData(updatedRoadmap)
        } else {
          // Create new roadmap with the generated course
          const newRoadmap = {
            roadmap: {
              title: "🚀 Your AI-Powered Learning Journey",
              currentLevel: userProfile?.currentRole || "Student",
              targetLevel: "ML Engineer",
              estimatedTimeframe: "6 months",
              confidenceScore: 92,
              salaryIncrease: "40-60%",
              courses: [result.customCourse.course]
            },
            aiInsights: {
              careerAnalysis: "Strong foundation with clear ML engineering goals",
              marketDemand: "High demand for ML engineers in the current market",
              competitiveAdvantage: "Personalized learning path optimized for your background"
            },
            nextSteps: [
              "Start with the foundational modules",
              "Complete hands-on projects",
              "Connect with industry mentors",
              "Build your portfolio"
            ],
            skillGaps: ["Advanced Python", "Deep Learning", "MLOps", "System Design"]
          }
          setRoadmapData(newRoadmap)
        }
        
        alert('🚀 Your personalized course has been generated! Check your roadmap below.')
      } else {
        const errorData = await response.text()
        console.error('Failed to generate course. Status:', response.status, 'Response:', errorData)
        alert('Failed to generate course. Please try again.')
      }
    } catch (error) {
      console.error('Course generation error:', error)
      console.error('Error details:', error instanceof Error ? error.message : String(error))
      alert('An error occurred while generating your course. Please check the console for details.')
    }
  }

  const handleCourseEnrollment = async (courseId: string) => {
    if (!authUser?.id) {
      console.error('No user ID available for enrollment')
      return
    }

    try {
      // First, try to find the lead record for this user
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('id')
        .eq('email', authUser.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (leadError || !leadData) {
        console.error('No lead record found, redirecting to masterclasses')
        router.push(`/masterclasses?course=${courseId}`)
        return
      }

      // Call our enrollment API
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          leadId: leadData.id,
          paymentAmount: 0 // For demo purposes
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Enrollment successful:', result)
        
        // Show success message or redirect
        alert('🎉 Successfully enrolled! Welcome to your AI-powered learning journey.')
        
        // Optionally redirect to course content
        router.push(`/courses/${courseId}`)
      } else {
        console.error('Enrollment failed')
        // Fallback to masterclasses page
        router.push(`/masterclasses?course=${courseId}`)
      }
    } catch (error) {
      console.error('Enrollment error:', error)
      // Fallback to masterclasses page
      router.push(`/masterclasses?course=${courseId}`)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'masterclass':
        return BookOpen
      case 'skill':
        return Target
      case 'project':
        return Award
      default:
        return BookOpen
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your career dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to ScalerAI</h1>
          <p className="text-muted-foreground mb-8">
            Take our AI career assessment to get your personalized dashboard
          </p>
          <UserAssessmentPopup onComplete={() => window.location.reload()}>
            <Button>Take Assessment</Button>
          </UserAssessmentPopup>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ScalerAI</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/masterclasses" className="text-sm font-medium hover:text-primary transition-colors">
              Masterclasses
            </Link>
            <Link href="/my-enrollments" className="text-sm font-medium hover:text-primary transition-colors">
              My Enrollments
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-primary">
              Dashboard
            </Link>
            {authUser && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{authUser.email}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile.name}!</h1>
          <p className="text-muted-foreground">
            Here's your personalized career roadmap and recommendations
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Masterclasses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registeredMasterclasses.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Learned</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                New technologies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Career Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">65%</div>
              <p className="text-xs text-muted-foreground">
                To next level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Goal</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">Mid-Level</div>
              <p className="text-xs text-muted-foreground">
                Developer
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revolutionary AI Course Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 text-white border-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 via-blue-600/80 to-cyan-600/80 backdrop-blur-sm"></div>
            <CardContent className="relative z-10 p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="bg-white/20 p-3 rounded-full mr-4">
                      <Zap className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">🚀 AI Course Generator</h3>
                      <p className="text-white/90 text-lg">
                        World's first AI that creates personalized courses just for YOU
                      </p>
                      <p className="text-white/70 text-sm mt-2">
                        Based on your skill gaps, career goals, and learning style - in seconds!
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/10 rounded-lg p-4">
                      <Brain className="w-6 h-6 mb-2" />
                      <div className="font-semibold">AI-Powered</div>
                      <div className="text-sm text-white/80">Learns your style</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <Target className="w-6 h-6 mb-2" />
                      <div className="font-semibold">Personalized</div>
                      <div className="text-sm text-white/80">Tailored for you</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <Award className="w-6 h-6 mb-2" />
                      <div className="font-semibold">Career-Focused</div>
                      <div className="text-sm text-white/80">Real outcomes</div>
                    </div>
                  </div>
                </div>
                
                <div className="ml-8">
                  <Button 
                    className="bg-white text-purple-600 hover:bg-white/90 text-lg px-8 py-6 h-auto"
                    onClick={handleGenerateCustomCourse}
                    disabled={!userProfile}
                  >
                    <Zap className="w-6 h-6 mr-2" />
                    Generate My Course
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <p className="text-white/70 text-xs mt-2 text-center">
                    ✨ Takes 30 seconds
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Revolutionary AI Roadmap */}
          {roadmapData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <AIRoadmap 
                roadmapData={roadmapData} 
                onEnrollCourse={handleCourseEnrollment}
              />
            </motion.div>
          )}

          {/* Fallback: Basic Career Roadmap if no AI data */}
          {!roadmapData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Your Career Roadmap</span>
                  </CardTitle>
                  <CardDescription>
                    Take our AI assessment to unlock your personalized roadmap
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-6">
                    Get your AI-powered career roadmap with personalized courses and learning paths
                  </p>
                  <UserAssessmentPopup onComplete={() => window.location.reload()}>
                    <Button>Take AI Assessment</Button>
                  </UserAssessmentPopup>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Profile Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm">Current Role</h4>
                    <p className="text-sm text-muted-foreground">{userProfile.currentRole}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Experience Level</h4>
                    <p className="text-sm text-muted-foreground">{userProfile.experienceLevel}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Career Goals</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">{userProfile.careerGoals}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Tech Stack</h4>
                    <div className="flex flex-wrap gap-1">
                      {userProfile.preferredTechStack.map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/">Update Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/masterclasses">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse Masterclasses
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Consultation
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/">
                      <Target className="w-4 h-4 mr-2" />
                      Update Goals
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

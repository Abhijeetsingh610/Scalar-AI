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
  Lock, 
  CheckCircle, 
  Award,
  BookOpen,
  Target,
  Zap,
  Crown,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

interface Module {
  moduleNumber: number
  title: string
  topics: string[]
  duration: string
  isPreview: boolean
  requiresPremium?: boolean
  practicalProjects?: string[]
}

interface Course {
  id: string
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  price: number
  originalPrice?: number
  rating: number
  students: number
  isPremium: boolean
  technologies: string[]
  outcomes: string[]
  modules: Module[]
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const supabase = createClientComponentClient()

  const courseId = params.courseId as string

  useEffect(() => {
    // Check if this is a custom generated course
    if (courseId.startsWith('custom-course-')) {
      // Load from localStorage or create a demo course
      loadCustomCourse()
    } else {
      // Load from database for regular courses
      loadRegularCourse()
    }
    
    // Check enrollment status
    checkEnrollmentStatus()
  }, [courseId])

  const checkEnrollmentStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.email) {
        return // Not logged in, so not enrolled
      }

      // First find the lead record for this user
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('id')
        .eq('email', user.email!)
        .single()

      if (leadError || !leadData) {
        return // No lead record, so not enrolled
      }

      // Check if user is enrolled in this course
      const { data: enrollment, error } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('lead_id', leadData.id)
        .single()

      if (enrollment && !error) {
        setIsEnrolled(true)
      }
    } catch (error) {
      console.log('No enrollment found or error checking:', error)
      // Don't set enrolled status on error
    }
  }

  const loadCustomCourse = () => {
    // Create a demo course for custom generated courses
    const demoCustomCourse: Course = {
      id: courseId,
      title: "🚀 AI-Generated ML Engineer Course",
      description: "Your personalized machine learning engineering course, crafted by AI based on your career goals and current skill level.",
      difficulty: "Intermediate",
      duration: "6 months",
      price: 299,
      originalPrice: 499,
      rating: 4.9,
      students: 1247,
      isPremium: true,
      technologies: ["Python", "TensorFlow", "PyTorch", "Docker", "AWS", "MLOps"],
      outcomes: [
        "Master machine learning algorithms and frameworks",
        "Build and deploy ML models in production",
        "Understand MLOps and model lifecycle management",
        "Gain hands-on experience with real-world projects",
        "Prepare for senior ML engineer roles"
      ],
      modules: [
        {
          moduleNumber: 1,
          title: "Python for Machine Learning",
          topics: ["Advanced Python", "NumPy & Pandas", "Data Preprocessing", "Feature Engineering"],
          duration: "2 weeks",
          isPreview: true,
          requiresPremium: false,
          practicalProjects: ["Data Analysis Project"]
        },
        {
          moduleNumber: 2,
          title: "Machine Learning Fundamentals",
          topics: ["Supervised Learning", "Unsupervised Learning", "Model Evaluation", "Cross-Validation"],
          duration: "3 weeks",
          isPreview: true,
          requiresPremium: false,
          practicalProjects: ["ML Model Building"]
        },
        {
          moduleNumber: 3,
          title: "Deep Learning with TensorFlow",
          topics: ["Neural Networks", "CNNs", "RNNs", "Transfer Learning"],
          duration: "4 weeks",
          isPreview: false,
          requiresPremium: true,
          practicalProjects: ["Image Classification Model"]
        },
        {
          moduleNumber: 4,
          title: "MLOps and Deployment",
          topics: ["Model Versioning", "CI/CD for ML", "Docker Containers", "Cloud Deployment"],
          duration: "3 weeks",
          isPreview: false,
          requiresPremium: true,
          practicalProjects: ["Production ML Pipeline"]
        },
        {
          moduleNumber: 5,
          title: "Capstone Project",
          topics: ["End-to-end ML Project", "Industry Best Practices", "Portfolio Development"],
          duration: "4 weeks",
          isPreview: false,
          requiresPremium: true,
          practicalProjects: ["Complete ML Application"]
        }
      ]
    }
    
    setCourse(demoCustomCourse)
    setLoading(false)
  }

  const loadRegularCourse = () => {
    // For regular courses, you would fetch from database
    setLoading(false)
  }

  const handleEnrollment = async () => {
    setEnrolling(true)
    
    try {
      // Call the actual enrollment API
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.email) {
        alert('Please log in to enroll in courses')
        router.push('/login')
        return
      }

      // First, try to find the lead record for this user
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('id')
        .eq('email', user.email!)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      let finalLeadId: string

      if (leadError || !leadData) {
        console.log('No lead record found, creating new one...')
        // Create a basic lead record for this user
        const { data: newLead, error: createError } = await supabase
          .from('leads')
          .insert({
            email: user.email!,
            name: user.user_metadata?.full_name || user.email!.split('@')[0],
            source: 'course_enrollment',
            status: 'qualified',
            score: 85
          })
          .select('id')
          .single()

        if (createError || !newLead) {
          console.error('Failed to create lead record:', createError)
          alert('Enrollment failed. Please try again.')
          return
        }

        finalLeadId = newLead.id
      } else {
        finalLeadId = leadData.id
      }

      // Before enrolling, check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('course_enrollments')
        .select('id, enrollment_status')
        .eq('lead_id', finalLeadId)
        .eq('course_id', courseId)
        .single()

      if (existingEnrollment) {
        setIsEnrolled(true)
        alert('You are already enrolled in this course! 🎓')
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
          leadId: finalLeadId,
          paymentAmount: course?.price || 0
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Enrollment successful:', result)
        
        setIsEnrolled(true)
        alert("🎉 Successfully enrolled! Welcome to your learning journey!")
        
        // Stay on the course page - don't redirect
        // The UI will update to show enrolled state
        
      } else {
        const errorData = await response.json()
        console.error('Enrollment failed:', errorData)
        
        if (response.status === 409) {
          setIsEnrolled(true)
          alert('You are already enrolled in this course! 🎓')
        } else {
          alert(`Enrollment failed: ${errorData.message || 'Please try again.'}`)
        }
      }
      
    } catch (error) {
      console.error('Enrollment error:', error)
      alert('Enrollment failed. Please try again.')
    } finally {
      setEnrolling(false)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
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
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            
            {isEnrolled && (
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
            <Badge className={getDifficultyColor(course.difficulty)}>
              {course.difficulty}
            </Badge>
            {course.isPremium && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {course.title}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {course.description}
          </p>

          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span>{course.students.toLocaleString()} students</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span>{course.rating} rating</span>
            </div>
          </div>

          {!isEnrolled && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-primary">${course.price}</span>
                  {course.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">${course.originalPrice}</span>
                  )}
                </div>
                {course.originalPrice && (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                  </Badge>
                )}
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-6"
                onClick={handleEnrollment}
                disabled={enrolling}
              >
                {enrolling ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Enrolling...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Enroll Now
                  </>
                )}
              </Button>
              
              <p className="text-sm text-muted-foreground mt-4 text-center">
                30-day money-back guarantee
              </p>
            </div>
          )}

          {isEnrolled && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-2xl p-8 max-w-md mx-auto shadow-lg border border-green-200 dark:border-green-800">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                  You're Enrolled! 🎉
                </h3>
                
                <p className="text-green-700 dark:text-green-300 mb-6">
                  Welcome to your AI-powered learning journey. Start with the free preview modules below.
                </p>
                
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 mb-4"
                  onClick={() => {
                    // Scroll to curriculum section
                    document.getElementById('curriculum-section')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Learning
                </Button>
                
                <div className="text-sm text-green-700 dark:text-green-300">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Award className="w-4 h-4" />
                    Certificate upon completion
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" />
                    Access to community
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Course Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                {/* Technologies */}
                <Card>
                  <CardHeader>
                    <CardTitle>Technologies You'll Learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {course.technologies.map((tech, index) => (
                        <Badge key={index} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Outcomes */}
                <Card>
                  <CardHeader>
                    <CardTitle>What You'll Achieve</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.outcomes.map((outcome, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-4" id="curriculum-section">
                {course.modules.map((module, index) => (
                  <Card key={module.moduleNumber}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isEnrolled ? 'bg-green-100 text-green-600' : 
                            module.isPreview ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {isEnrolled || module.isPreview ? <Play className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              Module {module.moduleNumber}: {module.title}
                            </CardTitle>
                            <CardDescription>{module.duration}</CardDescription>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!isEnrolled && module.isPreview && (
                            <Badge className="bg-green-100 text-green-800">
                              FREE PREVIEW
                            </Badge>
                          )}
                          {!isEnrolled && module.requiresPremium && (
                            <Badge className="bg-orange-100 text-orange-800">
                              PREMIUM
                            </Badge>
                          )}
                          {isEnrolled && module.requiresPremium && (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              UNLOCKED
                            </Badge>
                          )}
                          {isEnrolled && !module.requiresPremium && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              <Play className="w-3 h-3 mr-1" />
                              AVAILABLE
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {module.topics.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Topics Covered:</h4>
                          <div className="grid md:grid-cols-2 gap-2">
                            {module.topics.map((topic, topicIndex) => (
                              <div key={topicIndex} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-3 h-3 text-primary" />
                                {topic}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {module.practicalProjects && module.practicalProjects.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Practical Projects:</h4>
                          <div className="space-y-1">
                            {module.practicalProjects.map((project, projectIndex) => (
                              <div key={projectIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Award className="w-3 h-3 text-yellow-600" />
                                {project}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {isEnrolled && (
                        <div className="pt-4 border-t">
                          <Button 
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            onClick={() => {
                              alert(`Starting Module ${module.moduleNumber}: ${module.title}`)
                            }}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Module {module.moduleNumber}
                          </Button>
                        </div>
                      )}
                      
                      {!isEnrolled && !module.isPreview && (
                        <div className="pt-4 border-t">
                          <div className="text-center text-muted-foreground">
                            <Lock className="w-6 h-6 mx-auto mb-2" />
                            <p className="text-sm">Enroll to unlock this module</p>
                          </div>
                        </div>
                      )}
                      
                      {!isEnrolled && module.isPreview && (
                        <div className="pt-4 border-t">
                          <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              alert(`Preview of Module ${module.moduleNumber}: ${module.title}`)
                            }}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Preview Module
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="instructor">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">AI</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">AI-Powered Learning</h3>
                      <p className="text-muted-foreground mb-4">
                        This course is powered by advanced AI that adapts to your learning style and pace.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                          <h4 className="font-semibold">Personalized</h4>
                          <p className="text-sm text-muted-foreground">Tailored to your goals</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
                          <h4 className="font-semibold">Adaptive</h4>
                          <p className="text-sm text-muted-foreground">Adjusts to your progress</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card (if enrolled) */}
            {isEnrolled && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span>12%</span>
                      </div>
                      <Progress value={12} />
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4" />
                        Started: Today
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Estimated completion: 6 months
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features Card */}
            <Card>
              <CardHeader>
                <CardTitle>Course Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span className="text-sm">Lifetime Access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-sm">Certificate of Completion</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-sm">Community Access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="text-sm">AI-Powered Learning</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

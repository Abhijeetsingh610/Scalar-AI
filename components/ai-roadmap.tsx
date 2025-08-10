'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  Star,
  Clock,
  Users,
  BookOpen,
  Lock,
  CheckCircle,
  Play,
  Award,
  Zap,
  Target,
  DollarSign,
  ArrowRight,
  Crown,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

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

interface RoadmapData {
  roadmap: {
    title: string
    currentLevel: string
    targetLevel: string
    estimatedTimeframe: string
    confidenceScore: number
    salaryIncrease?: string
    courses: Course[]
  }
  aiInsights: {
    careerAnalysis: string
    marketDemand: string
    competitiveAdvantage: string
  }
  nextSteps: string[]
  skillGaps: string[]
}

interface AIRoadmapProps {
  roadmapData: RoadmapData | null
  onEnrollCourse: (courseId: string) => void
}

export default function AIRoadmap({ roadmapData, onEnrollCourse }: AIRoadmapProps) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<{[key: string]: boolean}>({})

  // Safety check and fallback data
  if (!roadmapData || !roadmapData.roadmap) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Your AI roadmap is being generated...
          </p>
          <Button asChild>
            <a href="/">Take Assessment Again</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const roadmap = roadmapData.roadmap
  const aiInsights = roadmapData.aiInsights || {
    careerAnalysis: "Analyzing your career trajectory...",
    marketDemand: "Evaluating market opportunities...",
    competitiveAdvantage: "Identifying your unique strengths..."
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const toggleModuleExpansion = (courseId: string, moduleId: string) => {
    const key = `${courseId}-${moduleId}`
    setExpandedModules(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="space-y-8">
      {/* AI-Powered Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full mr-3">
              <Brain className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold">{roadmap.title}</h1>
            <Sparkles className="w-6 h-6 ml-3 animate-pulse" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white/10 rounded-lg p-4">
              <TrendingUp className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm opacity-90">Career Progression</div>
              <div className="font-bold text-lg">{roadmap.estimatedTimeframe}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Target className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm opacity-90">AI Confidence</div>
              <div className="font-bold text-lg">{roadmap.confidenceScore}%</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <DollarSign className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm opacity-90">Expected Growth</div>
              <div className="font-bold text-lg">{roadmap.salaryIncrease || '40-60%'}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Current → Target Journey */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2 text-primary" />
            Your Career Transformation Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-gray-600" />
              </div>
              <div className="font-medium text-sm">Current</div>
              <div className="text-xs text-muted-foreground">{roadmap.currentLevel}</div>
            </div>
            
            <div className="flex-1 mx-4">
              <Progress value={65} className="h-3" />
              <div className="text-xs text-center mt-1 text-muted-foreground">65% Complete</div>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mb-2">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div className="font-medium text-sm">Target</div>
              <div className="text-xs text-muted-foreground">{roadmap.targetLevel}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-600" />
            AI Career Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-blue-700 dark:text-blue-300">Market Analysis</h4>
              <p className="text-sm text-muted-foreground">{aiInsights.marketDemand}</p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-purple-700 dark:text-purple-300">Career Trajectory</h4>
              <p className="text-sm text-muted-foreground">{aiInsights.careerAnalysis}</p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-green-700 dark:text-green-300">Competitive Edge</h4>
              <p className="text-sm text-muted-foreground">{aiInsights.competitiveAdvantage}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Roadmap */}
      {roadmap.courses && roadmap.courses.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center">
            <BookOpen className="w-6 h-6 mr-2" />
            Your Personalized Learning Path
          </h2>
          
          {roadmap.courses.map((course, courseIndex) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: courseIndex * 0.1 }}
            >
              <Card className={`transition-all duration-300 hover:shadow-lg ${
                selectedCourse === course.id ? 'ring-2 ring-primary' : ''
              }`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white">
                          Course {courseIndex + 1}
                        </Badge>
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
                      <CardTitle className="text-xl">{course.title}</CardTitle>
                      <CardDescription className="mt-2">{course.description}</CardDescription>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="flex items-center text-yellow-500 mb-1">
                        <Star className="w-4 h-4 fill-current mr-1" />
                        <span className="font-medium">{course.rating}</span>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {course.students.toLocaleString()} students
                      </div>
                    </div>
                  </div>

                  {/* Course Technologies */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {course.technologies.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  {/* Course Outcomes */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm mb-2">What you'll achieve:</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {course.outcomes.map((outcome, index) => (
                        <div key={index} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                          {outcome}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Course Modules */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Course Modules</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.duration}
                      </div>
                    </div>

                    {course.modules.map((module, moduleIndex) => {
                      const isExpanded = expandedModules[`${course.id}-${module.moduleNumber}`]
                      const showPreview = moduleIndex < 2 // First 2 modules are preview
                      
                      return (
                        <div key={module.moduleNumber} className={`border rounded-lg p-4 ${
                          showPreview ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' : 
                          'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                                showPreview ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'
                              }`}>
                                {showPreview ? <Play className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                              </div>
                              <div>
                                <h5 className="font-medium">{module.title}</h5>
                                <div className="text-sm text-muted-foreground">
                                  {module.duration} • {module.topics.length} topics
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {showPreview && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                  FREE PREVIEW
                                </Badge>
                              )}
                              {module.requiresPremium && (
                                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                                  PREMIUM
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleModuleExpansion(course.id, module.moduleNumber.toString())}
                              >
                                {isExpanded ? 'Show Less' : 'Show More'}
                              </Button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 space-y-3"
                              >
                                <div>
                                  <h6 className="font-medium text-sm mb-2">Topics Covered:</h6>
                                  <div className="grid md:grid-cols-2 gap-2">
                                    {module.topics.map((topic, topicIndex) => (
                                      <div key={topicIndex} className="flex items-center text-sm">
                                        <CheckCircle className="w-3 h-3 mr-2 text-primary flex-shrink-0" />
                                        {topic}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {module.practicalProjects && module.practicalProjects.length > 0 && (
                                  <div>
                                    <h6 className="font-medium text-sm mb-2">Practical Projects:</h6>
                                    <div className="space-y-1">
                                      {module.practicalProjects.map((project, projectIndex) => (
                                        <div key={projectIndex} className="flex items-center text-sm text-muted-foreground">
                                          <Award className="w-3 h-3 mr-2 text-yellow-600 flex-shrink-0" />
                                          {project}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {!showPreview && (
                                  <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 p-3 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <Lock className="w-4 h-4 mr-2 text-orange-600" />
                                        <span className="text-sm font-medium">Premium Content</span>
                                      </div>
                                      <Button size="sm" onClick={() => onEnrollCourse(course.id)}>
                                        Unlock Course
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>

                  {/* Course Pricing and CTA */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-primary">${course.price}</span>
                          {course.originalPrice && (
                            <span className="text-lg text-muted-foreground line-through">${course.originalPrice}</span>
                          )}
                          {course.originalPrice && (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                              {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Full lifetime access • Certificate of completion
                        </div>
                      </div>
                      
                      <Button 
                        className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/80 hover:to-purple-600/80"
                        onClick={() => onEnrollCourse(course.id)}
                      >
                        Enroll Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Next Steps */}
      {roadmapData.nextSteps && roadmapData.nextSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Your AI-Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roadmapData.nextSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">{index + 1}</span>
                  </div>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Brain, Target, Clock, TrendingUp, User, Briefcase, Code, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

interface UserAssessmentPopupProps {
  children: React.ReactNode
  onComplete?: () => void
}

export default function UserAssessmentPopup({ children, onComplete }: UserAssessmentPopupProps) {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [user, setUser] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    jobRole: '',
    experienceLevel: '',
    preferredTechStack: [] as string[],
    careerGoals: '',
    currentChallenges: '',
    learningPreference: '',
    technicalSkills: '',
    projectInterests: ''
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const experienceLevels = [
    '0-1 years (Beginner)',
    '1-3 years (Junior)', 
    '3-5 years (Mid-level)',
    '5-8 years (Senior)',
    '8+ years (Expert/Lead)'
  ]

  const techStacks = [
    'JavaScript/Node.js',
    'Python/Django',
    'React/Vue.js',
    'Java/Spring',
    'C#/.NET',
    'PHP/Laravel',
    'Ruby/Rails',
    'Go',
    'Rust',
    'Swift/iOS',
    'Kotlin/Android',
    'Flutter/Dart',
    'DevOps/AWS',
    'Machine Learning/AI',
    'Data Science',
    'Blockchain',
    'Cybersecurity',
    'UI/UX Design'
  ]

  const learningPreferences = [
    'Video Tutorials',
    'Hands-on Projects',
    'Reading Documentation',
    'Interactive Coding',
    'Group Discussions',
    'One-on-one Mentoring',
    'Self-paced Learning',
    'Structured Courses'
  ]

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const toggleTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      preferredTechStack: prev.preferredTechStack.includes(tech)
        ? prev.preferredTechStack.filter(t => t !== tech)
        : [...prev.preferredTechStack, tech]
    }))
  }

  const validateStep = (step: number) => {
    const newErrors: {[key: string]: string} = {}

    if (step === 1) {
      if (!formData.jobRole.trim()) newErrors.jobRole = 'Job role is required'
      if (!formData.experienceLevel) newErrors.experienceLevel = 'Experience level is required'
    }
    
    if (step === 2) {
      if (formData.preferredTechStack.length === 0) {
        newErrors.preferredTechStack = 'Please select at least one technology'
      }
      if (!formData.technicalSkills.trim()) {
        newErrors.technicalSkills = 'Please describe your technical skills'
      }
    }
    
    if (step === 3) {
      if (!formData.careerGoals.trim()) newErrors.careerGoals = 'Career goals are required'
      if (!formData.currentChallenges.trim()) newErrors.currentChallenges = 'Current challenges are required'
      if (!formData.learningPreference) newErrors.learningPreference = 'Learning preference is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsLoading(true)

    try {
      // Save assessment data to leads table with user info
      const assessmentData = {
        name: user?.user_metadata?.first_name && user?.user_metadata?.last_name 
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
          : user?.email?.split('@')[0] || 'User',
        email: user?.email || '',
        job_role: formData.jobRole,
        experience_level: formData.experienceLevel,
        preferred_tech_stack: formData.preferredTechStack,
        career_goals: formData.careerGoals,
        current_challenges: formData.currentChallenges,
        learning_preference: formData.learningPreference,
        technical_skills: formData.technicalSkills,
        project_interests: formData.projectInterests,
        assessment_type: 'retake',
        user_id: user?.id
      }

      const { error } = await supabase
        .from('leads')
        .insert([assessmentData])

      if (error) {
        console.error('Error saving assessment:', error)
        setErrors({ submit: 'Failed to save assessment. Please try again.' })
      } else {
        setIsSubmitted(true)
        setTimeout(() => {
          setOpen(false)
          setIsSubmitted(false)
          setCurrentStep(1)
          setFormData({
            jobRole: '',
            experienceLevel: '',
            preferredTechStack: [],
            careerGoals: '',
            currentChallenges: '',
            learningPreference: '',
            technicalSkills: '',
            projectInterests: ''
          })
          onComplete?.()
        }, 2000)
      }
    } catch (error) {
      console.error('Error:', error)
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    if (isSubmitted) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Assessment Updated!</h3>
          <p className="text-muted-foreground">
            Your career assessment has been successfully updated. We'll use this information to provide better recommendations.
          </p>
        </motion.div>
      )
    }

    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Professional Background</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="jobRole">Current Job Role</Label>
                <Input
                  id="jobRole"
                  placeholder="e.g., Software Developer, Product Manager"
                  value={formData.jobRole}
                  onChange={(e) => handleInputChange('jobRole', e.target.value)}
                  className={errors.jobRole ? 'border-red-500' : ''}
                />
                {errors.jobRole && <p className="text-sm text-red-500 mt-1">{errors.jobRole}</p>}
              </div>

              <div>
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select 
                  value={formData.experienceLevel} 
                  onValueChange={(value) => handleInputChange('experienceLevel', value)}
                >
                  <SelectTrigger className={errors.experienceLevel ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.experienceLevel && <p className="text-sm text-red-500 mt-1">{errors.experienceLevel}</p>}
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Code className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Technical Skills</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Preferred Technology Stack (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {techStacks.map((tech) => (
                    <div key={tech} className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant={formData.preferredTechStack.includes(tech) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTechStack(tech)}
                        className="w-full justify-start"
                      >
                        {tech}
                      </Button>
                    </div>
                  ))}
                </div>
                {errors.preferredTechStack && <p className="text-sm text-red-500 mt-1">{errors.preferredTechStack}</p>}
              </div>

              <div>
                <Label htmlFor="technicalSkills">Technical Skills & Expertise</Label>
                <Textarea
                  id="technicalSkills"
                  placeholder="Describe your technical skills, frameworks, tools, and areas of expertise..."
                  value={formData.technicalSkills}
                  onChange={(e) => handleInputChange('technicalSkills', e.target.value)}
                  className={errors.technicalSkills ? 'border-red-500' : ''}
                  rows={4}
                />
                {errors.technicalSkills && <p className="text-sm text-red-500 mt-1">{errors.technicalSkills}</p>}
              </div>

              <div>
                <Label htmlFor="projectInterests">Project Interests (Optional)</Label>
                <Textarea
                  id="projectInterests"
                  placeholder="What types of projects interest you? Any specific domains or technologies you'd like to explore?"
                  value={formData.projectInterests}
                  onChange={(e) => handleInputChange('projectInterests', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Career Goals & Learning</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="careerGoals">Career Goals</Label>
                <Textarea
                  id="careerGoals"
                  placeholder="What are your career aspirations? Where do you see yourself in the next 2-3 years?"
                  value={formData.careerGoals}
                  onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                  className={errors.careerGoals ? 'border-red-500' : ''}
                  rows={3}
                />
                {errors.careerGoals && <p className="text-sm text-red-500 mt-1">{errors.careerGoals}</p>}
              </div>

              <div>
                <Label htmlFor="currentChallenges">Current Challenges</Label>
                <Textarea
                  id="currentChallenges"
                  placeholder="What challenges are you facing in your career? What skills do you need to develop?"
                  value={formData.currentChallenges}
                  onChange={(e) => handleInputChange('currentChallenges', e.target.value)}
                  className={errors.currentChallenges ? 'border-red-500' : ''}
                  rows={3}
                />
                {errors.currentChallenges && <p className="text-sm text-red-500 mt-1">{errors.currentChallenges}</p>}
              </div>

              <div>
                <Label htmlFor="learningPreference">Preferred Learning Style</Label>
                <Select 
                  value={formData.learningPreference} 
                  onValueChange={(value) => handleInputChange('learningPreference', value)}
                >
                  <SelectTrigger className={errors.learningPreference ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select your preferred learning style" />
                  </SelectTrigger>
                  <SelectContent>
                    {learningPreferences.map((preference) => (
                      <SelectItem key={preference} value={preference}>{preference}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.learningPreference && <p className="text-sm text-red-500 mt-1">{errors.learningPreference}</p>}
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <span>Update Career Assessment</span>
          </DialogTitle>
          <DialogDescription>
            Update your career goals and preferences to get personalized recommendations.
          </DialogDescription>
        </DialogHeader>

        {!isSubmitted && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-muted-foreground">Step {currentStep} of 3</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {renderStep()}

        {errors.submit && (
          <div className="text-sm text-red-500 mt-2">{errors.submit}</div>
        )}

        {!isSubmitted && (
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Complete Assessment'}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

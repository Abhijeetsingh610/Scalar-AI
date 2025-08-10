'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Brain, Target, Clock, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface AssessmentPopupProps {
  children: React.ReactNode
  onComplete?: () => void
  isRetake?: boolean
}

export default function AssessmentPopup({ children, onComplete, isRetake = false }: AssessmentPopupProps) {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    jobRole: '',
    experienceLevel: '',
    preferredTechStack: [] as string[],
    careerGoals: '',
    currentChallenges: '',
    learningPreference: ''
  })

  const supabase = createClientComponentClient()

  const experienceLevels = [
    '0-1 years (Beginner)',
    '1-3 years (Junior)',
    '3-5 years (Mid-level)',
    '5-8 years (Senior)',
    '8+ years (Expert/Lead)'
  ]

  const techStacks = [
    'Frontend Development',
    'Backend Development',
    'Full Stack Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'DevOps',
    'Cloud Computing',
    'Cybersecurity',
    'Product Management'
  ]

  const learningPreferences = [
    'Live masterclasses',
    'Self-paced courses',
    'One-on-one mentoring',
    'Project-based learning',
    'Mixed approach'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleTechStackToggle = (tech: string) => {
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
      if (!formData.name.trim()) newErrors.name = 'Name is required'
      if (!formData.email.trim()) newErrors.email = 'Email is required'
      if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email'
    }

    if (step === 2) {
      if (!formData.jobRole.trim()) newErrors.jobRole = 'Current role is required'
      if (!formData.experienceLevel) newErrors.experienceLevel = 'Experience level is required'
    }

    if (step === 3) {
      if (formData.preferredTechStack.length === 0) newErrors.preferredTechStack = 'Select at least one area of interest'
      if (!formData.careerGoals.trim()) newErrors.careerGoals = 'Career goals are required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const leadData = {
        name: formData.name,
        email: formData.email,
        job_role: formData.jobRole,
        experience_level: formData.experienceLevel,
        preferred_tech_stack: formData.preferredTechStack,
        career_goals: formData.careerGoals,
        current_challenges: formData.currentChallenges,
        learning_preference: formData.learningPreference,
        user_id: user?.id || null
      }

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      })

      if (!response.ok) {
        throw new Error('Failed to submit assessment')
      }

      setIsSubmitted(true)
      onComplete?.()
    } catch (error) {
      console.error('Error submitting assessment:', error)
      setErrors({ careerGoals: 'Failed to submit assessment. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setCurrentStep(1)
    setIsSubmitted(false)
    setFormData({
      name: '',
      email: '',
      jobRole: '',
      experienceLevel: '',
      preferredTechStack: [],
      careerGoals: '',
      currentChallenges: '',
      learningPreference: ''
    })
    setErrors({})
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-primary" />
            <span>{isRetake ? 'Retake Career Assessment' : 'AI Career Assessment'}</span>
          </DialogTitle>
          <DialogDescription>
            {isRetake 
              ? 'Update your profile and get new personalized recommendations'
              : 'Get personalized course recommendations based on your goals and experience'
            }
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Assessment Complete!</h3>
            <p className="text-muted-foreground mb-6">
              {isRetake 
                ? 'Your updated recommendations are being generated. Refresh your dashboard to see them!'
                : 'Your personalized recommendations are being generated. Refresh your dashboard to see them!'
              }
            </p>
            <Button onClick={resetForm}>Close</Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-8 h-px ${step < currentStep ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">Tell us about yourself</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleNext}>Next</Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Professional Info */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">Your professional background</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="jobRole">Current Role</Label>
                  <Input
                    id="jobRole"
                    value={formData.jobRole}
                    onChange={(e) => handleInputChange('jobRole', e.target.value)}
                    placeholder="e.g., Software Developer, Product Manager"
                  />
                  {errors.jobRole && <p className="text-sm text-red-500">{errors.jobRole}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select onValueChange={(value: string) => handleInputChange('experienceLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.experienceLevel && <p className="text-sm text-red-500">{errors.experienceLevel}</p>}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                  <Button onClick={handleNext}>Next</Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Goals & Preferences */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">Your goals and interests</h3>
                
                <div className="space-y-2">
                  <Label>Areas of Interest (select multiple)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {techStacks.map((tech) => (
                      <Button
                        key={tech}
                        variant={formData.preferredTechStack.includes(tech) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTechStackToggle(tech)}
                        className="justify-start"
                      >
                        {tech}
                      </Button>
                    ))}
                  </div>
                  {errors.preferredTechStack && <p className="text-sm text-red-500">{errors.preferredTechStack}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="careerGoals">Career Goals</Label>
                  <Textarea
                    id="careerGoals"
                    value={formData.careerGoals}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('careerGoals', e.target.value)}
                    placeholder="What are your career aspirations?"
                    rows={3}
                  />
                  {errors.careerGoals && <p className="text-sm text-red-500">{errors.careerGoals}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentChallenges">Current Challenges (Optional)</Label>
                  <Textarea
                    id="currentChallenges"
                    value={formData.currentChallenges}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('currentChallenges', e.target.value)}
                    placeholder="What challenges are you facing in your career?"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preferred Learning Style</Label>
                  <Select onValueChange={(value: string) => handleInputChange('learningPreference', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="How do you prefer to learn?" />
                    </SelectTrigger>
                    <SelectContent>
                      {learningPreferences.map((pref) => (
                        <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Complete Assessment'}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

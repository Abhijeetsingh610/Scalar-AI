'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Code, Target, ArrowRight, CheckCircle, Zap } from 'lucide-react'
import AssessmentPopup from '@/components/assessment-popup'
import UserAssessmentPopup from '@/components/user-assessment-popup'

interface FormData {
  name: string
  email: string
  currentRole: string
  experienceLevel: string
  careerGoals: string
  preferredTechStack: string[]
}

interface FormErrors {
  name?: string
  email?: string
  currentRole?: string
  experienceLevel?: string
  careerGoals?: string
  preferredTechStack?: string
}

const EXPERIENCE_LEVELS = [
  'Student',
  '0-2 years',
  '2-5 years', 
  '5+ years'
]

const TECH_STACKS = [
  'JavaScript/React',
  'Python',
  'Java',
  'C++/C#',
  'Data Engineering',
  'DevOps/Cloud',
  'Mobile Development',
  'Machine Learning/AI',
  'Full Stack',
  'Backend Development',
  'Frontend Development',
  'Cybersecurity'
]

export default function CareerAssessmentForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    currentRole: '',
    experienceLevel: '',
    careerGoals: '',
    preferredTechStack: [],
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [step, setStep] = useState(1)

  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {}

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required'
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid'
      }
      if (!formData.currentRole.trim()) newErrors.currentRole = 'Current role is required'
    }

    if (currentStep === 2) {
      if (!formData.experienceLevel) newErrors.experienceLevel = 'Experience level is required'
      if (formData.preferredTechStack.length === 0) {
        newErrors.preferredTechStack = 'Select at least one tech stack'
      }
    }

    if (currentStep === 3) {
      if (!formData.careerGoals.trim()) newErrors.careerGoals = 'Career goals are required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(3)) return

    setIsSubmitting(true)

    try {
      // Submit lead data
      const leadResponse = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (leadResponse.ok) {
        // Generate AI roadmap
        const roadmapResponse = await fetch('/api/llm/personalize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            currentRole: formData.currentRole,
            experienceLevel: formData.experienceLevel,
            careerGoals: formData.careerGoals,
            preferredTechStack: formData.preferredTechStack
          }),
        })

        if (roadmapResponse.ok) {
          const roadmapData = await roadmapResponse.json()
          // Store roadmap in localStorage for dashboard
          localStorage.setItem('userRoadmap', JSON.stringify(roadmapData))
        }

        setIsSubmitted(true)
      } else {
        throw new Error('Failed to submit assessment')
      }
    } catch (error) {
      console.error('Error submitting assessment:', error)
      setErrors({ careerGoals: 'Failed to submit assessment. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const toggleTechStack = (tech: string) => {
    const updated = formData.preferredTechStack.includes(tech)
      ? formData.preferredTechStack.filter(t => t !== tech)
      : [...formData.preferredTechStack, tech]
    handleInputChange('preferredTechStack', updated)
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto"
      >
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
            <CardDescription>
              Your personalized career roadmap is ready! Check your email and explore recommended masterclasses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <a href="/dashboard">View My Roadmap</a>
              </Button>
              <UserAssessmentPopup onComplete={() => window.location.reload()}>
                <Button variant="outline" className="w-full">
                  Take Another Assessment
                </Button>
              </UserAssessmentPopup>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto"
    >
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {step === 1 && <Brain className="w-8 h-8 text-primary" />}
            {step === 2 && <Code className="w-8 h-8 text-primary" />}
            {step === 3 && <Target className="w-8 h-8 text-primary" />}
          </div>
          <CardTitle className="text-2xl">AI Career Assessment</CardTitle>
          <CardDescription>
            Step {step} of 3: Get your personalized tech career roadmap and masterclass recommendations
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className={`bg-primary h-2 rounded-full transition-all duration-300 ${
                step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'
              }`}
            />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className={errors.name ? 'border-red-500' : ''}
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
                    placeholder="Enter your email"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentRole">Current Role</Label>
                  <Input
                    id="currentRole"
                    type="text"
                    value={formData.currentRole}
                    onChange={(e) => handleInputChange('currentRole', e.target.value)}
                    placeholder="e.g., Software Engineer, Student, Product Manager"
                    className={errors.currentRole ? 'border-red-500' : ''}
                  />
                  {errors.currentRole && <p className="text-sm text-red-500">{errors.currentRole}</p>}
                </div>

                <Button type="button" onClick={nextStep} className="w-full">
                  Next: Experience & Skills
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Experience & Tech Stack */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => handleInputChange('experienceLevel', level)}
                        className={`p-3 text-sm rounded-lg border transition-colors ${
                          formData.experienceLevel === level
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  {errors.experienceLevel && <p className="text-sm text-red-500">{errors.experienceLevel}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Preferred Tech Stack (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {TECH_STACKS.map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => toggleTechStack(tech)}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          formData.preferredTechStack.includes(tech)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                  {errors.preferredTechStack && <p className="text-sm text-red-500">{errors.preferredTechStack}</p>}
                </div>

                <div className="flex space-x-3">
                  <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep} className="flex-1">
                    Next: Career Goals
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Career Goals */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="careerGoals">Career Goals</Label>
                  <textarea
                    id="careerGoals"
                    value={formData.careerGoals}
                    onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                    placeholder="Describe your career goals, what you want to achieve, and any specific areas you want to focus on..."
                    className={`w-full min-h-[100px] p-3 rounded-md border ${
                      errors.careerGoals ? 'border-red-500' : 'border-gray-300'
                    } focus:border-primary focus:outline-none resize-y`}
                    rows={4}
                  />
                  {errors.careerGoals && <p className="text-sm text-red-500">{errors.careerGoals}</p>}
                </div>

                <div className="flex space-x-3">
                  <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creating Roadmap...
                      </>
                    ) : (
                      <>
                        Get My AI Roadmap
                        <Zap className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

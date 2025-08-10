'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Search, Filter, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import MasterclassCard from '@/components/masterclass-card'
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
  price: number
  rating: number
  is_free: boolean
}

const DIFFICULTY_FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced']
const TECH_FILTERS = [
  'All',
  'JavaScript/React',
  'Python',
  'Java',
  'Data Engineering',
  'DevOps/Cloud',
  'Machine Learning/AI',
  'Mobile Development'
]

export default function MasterclassesPage() {
  const [masterclasses, setMasterclasses] = useState<Masterclass[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [techFilter, setTechFilter] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [registering, setRegistering] = useState<string | null>(null)

  useEffect(() => {
    fetchMasterclasses()
  }, [])

  const fetchMasterclasses = async () => {
    try {
      const response = await fetch('/api/masterclasses')
      if (response.ok) {
        const result = await response.json()
        setMasterclasses(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching masterclasses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (masterclassId: string) => {
    setRegistering(masterclassId)
    try {
      // First, get the current user
      const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs')
      const supabase = createClientComponentClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.email) {
        alert('Please log in to register for masterclasses')
        return
      }

      // Find or create lead record for this user
      let leadId: string
      
      const { data: existingLead, error: leadError } = await supabase
        .from('leads')
        .select('id')
        .eq('email', user.email)
        .single()

      if (existingLead && !leadError) {
        leadId = existingLead.id
        
        // Check if already enrolled in this masterclass
        const { data: existingRegistration } = await supabase
          .from('masterclass_registrations')
          .select('id')
          .eq('lead_id', leadId)
          .eq('masterclass_id', masterclassId)
          .single()

        if (existingRegistration) {
          alert('You are already enrolled in this masterclass! 🎓')
          // Redirect to the masterclass detail page
          window.location.href = `/masterclasses/${masterclassId}`
          return
        }
      } else {
        // Create a new lead record
        const { data: newLead, error: createError } = await supabase
          .from('leads')
          .insert({
            email: user.email,
            name: user.user_metadata?.full_name || user.email.split('@')[0],
            source: 'masterclass_registration',
            status: 'lead',
            score: 75
          })
          .select('id')
          .single()

        if (createError || !newLead) {
          console.error('Failed to create lead:', createError)
          alert('Registration failed. Please try again.')
          return
        }
        
        leadId = newLead.id
      }

      // Now register for the masterclass
      const response = await fetch('/api/masterclasses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: leadId,
          masterclassId: masterclassId,
        }),
      })
      
      if (response.ok) {
        alert('🎉 Successfully registered for the masterclass!')
        // Refresh masterclasses to update attendee count
        fetchMasterclasses()
        
        // Redirect to the masterclass detail page
        setTimeout(() => {
          window.location.href = `/masterclasses/${masterclassId}`
        }, 1500)
      } else {
        const errorData = await response.json()
        if (response.status === 409) {
          alert('You are already registered for this masterclass!')
          // Redirect to the masterclass detail page
          setTimeout(() => {
            window.location.href = `/masterclasses/${masterclassId}`
          }, 1000)
        } else {
          alert(`Registration failed: ${errorData.error || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Error registering for masterclass:', error)
      alert('Registration failed. Please try again.')
    } finally {
      setRegistering(null)
    }
  }

  const filteredMasterclasses = masterclasses.filter(mc => {
    const matchesSearch = mc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mc.instructor_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDifficulty = difficultyFilter === 'All' || mc.difficulty_level === difficultyFilter
    
    const matchesTech = techFilter === 'All' || mc.tech_stack.some(tech => 
      tech.toLowerCase().includes(techFilter.toLowerCase()) || 
      techFilter.toLowerCase().includes(tech.toLowerCase())
    )
    
    return matchesSearch && matchesDifficulty && matchesTech
  })

  // Sample data for demo
  const sampleMasterclasses: Masterclass[] = [
    {
      id: '1',
      title: 'Full Stack Development with React & Node.js',
      description: 'Learn to build complete web applications from frontend to backend using modern technologies.',
      instructor_name: 'Sarah Johnson',
      instructor_title: 'Senior Software Engineer at Google',
      tech_stack: ['JavaScript/React', 'Node.js', 'MongoDB'],
      difficulty_level: 'Intermediate',
      scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 120,
      max_attendees: 1000,
      current_attendees: 934,
      price: 0,
      rating: 4.8,
      is_free: true
    },
    {
      id: '2',
      title: 'Machine Learning Fundamentals with Python',
      description: 'Get started with machine learning concepts and implement your first ML models using Python and scikit-learn.',
      instructor_name: 'Dr. Michael Chen',
      instructor_title: 'ML Research Scientist at OpenAI',
      tech_stack: ['Python', 'Machine Learning/AI', 'TensorFlow'],
      difficulty_level: 'Beginner',
      scheduled_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 90,
      max_attendees: 1000,
      current_attendees: 867,
      price: 49,
      rating: 4.9,
      is_free: false
    },
    {
      id: '3',
      title: 'Cloud Architecture on AWS',
      description: 'Master cloud architecture patterns and learn to design scalable applications on Amazon Web Services.',
      instructor_name: 'Emily Rodriguez',
      instructor_title: 'Cloud Solutions Architect at AWS',
      tech_stack: ['DevOps/Cloud', 'AWS', 'Kubernetes'],
      difficulty_level: 'Advanced',
      scheduled_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 150,
      max_attendees: 1000,
      current_attendees: 923,
      price: 99,
      rating: 4.7,
      is_free: false
    }
  ]

  const displayMasterclasses = masterclasses.length > 0 ? filteredMasterclasses : sampleMasterclasses.filter(mc => {
    const matchesSearch = mc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mc.instructor_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDifficulty = difficultyFilter === 'All' || mc.difficulty_level === difficultyFilter
    
    const matchesTech = techFilter === 'All' || mc.tech_stack.some(tech => 
      tech.toLowerCase().includes(techFilter.toLowerCase()) || 
      techFilter.toLowerCase().includes(tech.toLowerCase())
    )
    
    return matchesSearch && matchesDifficulty && matchesTech
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ScalerAI</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/masterclasses" className="text-sm font-medium text-primary">
              Masterclasses
            </Link>
            <Link href="/my-enrollments" className="text-sm font-medium hover:text-primary transition-colors">
              My Enrollments
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/signup" className="text-sm font-medium hover:text-primary transition-colors">
              Sign Up
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Expert-Led Masterclasses
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Learn from industry experts through live, interactive sessions designed to accelerate your tech career.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="px-4 mb-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search masterclasses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-card rounded-lg border"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTY_FILTERS.map(level => (
                      <Button
                        key={level}
                        variant={difficultyFilter === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDifficultyFilter(level)}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Technology</label>
                  <div className="flex flex-wrap gap-2">
                    {TECH_FILTERS.map(tech => (
                      <Button
                        key={tech}
                        variant={techFilter === tech ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTechFilter(tech)}
                      >
                        {tech}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Masterclasses Grid */}
      <section className="px-4 pb-20">
        <div className="container mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : displayMasterclasses.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No masterclasses found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
              <Button onClick={() => {
                setSearchTerm('')
                setDifficultyFilter('All')
                setTechFilter('All')
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayMasterclasses.map((masterclass, index) => (
                <MasterclassCard
                  key={masterclass.id}
                  masterclass={masterclass}
                  isRecommended={index === 0} // First card is marked as recommended for demo
                  onRegister={handleRegister}
                  isLoading={registering === masterclass.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

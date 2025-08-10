'use client'

import { motion } from 'framer-motion'
import { Brain, Zap, Target, Users, BarChart3, Code, GraduationCap, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import CareerAssessmentForm from '@/components/lead-form'
import Link from 'next/link'

const features = [
  {
    icon: Brain,
    title: 'AI Career Guidance',
    description: 'Get personalized career recommendations based on your skills, experience, and goals'
  },
  {
    icon: GraduationCap,
    title: 'Expert Masterclasses',
    description: 'Learn from industry experts through live masterclasses and interactive sessions'
  },
  {
    icon: Code,
    title: 'Tech-Focused Learning',
    description: 'Specialized courses in the latest technologies and programming languages'
  },
  {
    icon: Target,
    title: 'Goal-Oriented Paths',
    description: 'Structured learning paths designed to achieve your specific career objectives'
  },
  {
    icon: TrendingUp,
    title: 'Career Acceleration',
    description: 'Fast-track your tech career with proven strategies and industry insights'
  },
  {
    icon: Users,
    title: '1-on-1 Consultations',
    description: 'Personal career guidance sessions with experienced tech professionals'
  }
]

export default function HomePage() {
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
            <Link href="/masterclasses" className="text-sm font-medium hover:text-primary transition-colors">
              Masterclasses
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
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              AI-Powered Tech Career Accelerator
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Transform your tech career with personalized AI guidance, expert masterclasses, and proven learning paths tailored to your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" asChild>
                <Link href="#assessment">Start Free Assessment</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/masterclasses">Browse Masterclasses</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>10,000+ Career Accelerated</span>
              </div>
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4" />
                <span>500+ Expert Instructors</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>95% Job Placement Rate</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lead Form Section */}
      <section id="assessment" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Start Your Tech Career Journey</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take our AI-powered career assessment to get personalized masterclass recommendations 
              and a roadmap tailored to your goals and experience level.
            </p>
          </div>
          <CareerAssessmentForm />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose ScalerAI?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Leverage cutting-edge AI technology to accelerate your tech career with personalized learning paths and expert guidance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Success Stories
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Join thousands of professionals who've transformed their tech careers with ScalerAI's AI-powered guidance and expert masterclasses.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <div className="text-lg font-semibold mb-1">Job Placement Rate</div>
                <div className="text-sm text-muted-foreground">Within 6 months of completing our program</div>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="text-4xl font-bold text-primary mb-2">3x</div>
                <div className="text-lg font-semibold mb-1">Average Salary Increase</div>
                <div className="text-sm text-muted-foreground">Career transitions with our guidance</div>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-lg font-semibold mb-1">Expert Instructors</div>
                <div className="text-sm text-muted-foreground">From top tech companies worldwide</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Accelerate Your Tech Career?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start with our free AI career assessment and get personalized recommendations for your next career move.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="#assessment">Take Free Assessment</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/masterclasses">Explore Masterclasses</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">ScalerAI</span>
          </div>
          <p className="text-sm">
            © 2024 ScalerAI. Accelerating tech careers with AI-powered guidance.
          </p>
        </div>
      </footer>
    </div>
  )
}

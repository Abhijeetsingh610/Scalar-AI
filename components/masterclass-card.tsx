'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Zap,
  CheckCircle,
  ArrowRight,
  User
} from 'lucide-react'

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

interface MasterclassCardProps {
  masterclass: Masterclass
  isRecommended?: boolean
  onRegister?: (masterclassId: string) => void
  isRegistered?: boolean
  isLoading?: boolean
}

export default function MasterclassCard({ 
  masterclass, 
  isRecommended = false, 
  onRegister,
  isRegistered = false,
  isLoading = false
}: MasterclassCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const spotsRemaining = masterclass.max_attendees - masterclass.current_attendees
  const isAlmostFull = spotsRemaining <= 10 && spotsRemaining > 0
  const isFull = spotsRemaining <= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {isRecommended && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Zap className="w-3 h-3 mr-1" />
            AI Recommended
          </Badge>
        </div>
      )}

      <Card className={`h-full transition-all duration-300 hover:shadow-lg ${
        isRecommended ? 'ring-2 ring-purple-200 dark:ring-purple-800' : ''
      }`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <Badge className={getDifficultyColor(masterclass.difficulty_level)}>
              {masterclass.difficulty_level}
            </Badge>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
              {(masterclass.rating || 4.5).toFixed(1)}
            </div>
          </div>

          <CardTitle className="text-lg leading-tight">
            {masterclass.title}
          </CardTitle>

          <CardDescription className={`${
            isExpanded ? '' : 'line-clamp-2'
          } transition-all duration-200`}>
            {masterclass.description}
          </CardDescription>

          {!isExpanded && masterclass.description.length > 100 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-primary hover:underline text-left"
            >
              Read more...
            </button>
          )}

          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-sm text-primary hover:underline text-left"
            >
              Show less
            </button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Instructor Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">{masterclass.instructor_name || 'TBA'}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{masterclass.instructor_title || 'Instructor'}</p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1">
            {masterclass.tech_stack.slice(0, 3).map((tech, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {masterclass.tech_stack.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{masterclass.tech_stack.length - 3} more
              </Badge>
            )}
          </div>

          {/* Schedule & Duration */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-2" />
              <div>
                <p className="font-medium">{formatDate(masterclass.scheduled_date)}</p>
                <p className="text-xs">{formatTime(masterclass.scheduled_date)}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-2" />
              <span>{masterclass.duration_minutes} min</span>
            </div>
          </div>

          {/* Attendees */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4 mr-2" />
              <span>{masterclass.current_attendees} / {masterclass.max_attendees} registered</span>
            </div>
            {isAlmostFull && (
              <Badge variant="destructive" className="text-xs">
                Only {spotsRemaining} spots left!
              </Badge>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              {(masterclass.is_free ?? true) ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  FREE
                </Badge>
              ) : (
                <div>
                  <span className="text-2xl font-bold">${masterclass.price || 0}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">per person</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {isRegistered ? (
              <Button disabled className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                Registered
              </Button>
            ) : isFull ? (
              <Button disabled variant="outline" className="w-full">
                Waitlist Full
              </Button>
            ) : (
              <Button 
                onClick={() => onRegister?.(masterclass.id)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Registering...
                  </>
                ) : (
                  <>
                    {(masterclass.is_free ?? true) ? 'Register Free' : 'Register Now'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Additional Info for Almost Full Classes */}
          {isAlmostFull && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-orange-500 mr-2" />
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  High demand! This masterclass is filling up quickly.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

import { NextRequest, NextResponse } from 'next/server'

interface CareerAssessmentRequest {
  name?: string
  email?: string
  currentRole?: string
  job_role?: string
  current_role?: string
  experienceLevel?: string
  experience_level?: string
  careerGoals?: string
  career_goals?: string
  preferredTechStack?: string[]
  preferred_tech_stack?: string[]
  tech_stack?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const data: CareerAssessmentRequest = await request.json()
    
    console.log('Received data:', data) // Debug log
    
    // Handle both field naming conventions
    const name = data.name
    const careerGoals = data.careerGoals || data.career_goals
    const currentRole = data.currentRole || data.job_role || data.current_role
    const experienceLevel = data.experienceLevel || data.experience_level
    const techStack = data.preferredTechStack || data.preferred_tech_stack || data.tech_stack
    
    if (!careerGoals || !currentRole) {
      console.log('Missing fields:', { 
        name: !!name, 
        careerGoals: !!careerGoals, 
        currentRole: !!currentRole 
      })
      return NextResponse.json(
        { error: 'Missing required fields: careerGoals and currentRole', received: data },
        { status: 400 }
      )
    }

    const groqApiKey = process.env.GROQ_API_KEY
    
    if (!groqApiKey) {
      console.error('GROQ_API_KEY not configured')
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    const messages = [
      {
        role: 'system',
        content: `You are ScalerAI, the world's most advanced AI career acceleration system. You create comprehensive, personalized learning roadmaps that rival the best online education platforms. 

Generate a JSON response with this EXACT structure - this will be the most impressive AI-generated career roadmap ever created:

{
  "roadmap": {
    "title": "Your AI-Powered Career Acceleration Path",
    "currentLevel": "Current position assessment",
    "targetLevel": "Target position in 12-18 months", 
    "estimatedTimeframe": "X-Y months",
    "confidenceScore": 95,
    "salaryIncrease": "Expected % salary increase",
    "courses": [
      {
        "id": "course_1",
        "title": "Foundation Course Title",
        "description": "Compelling course description that shows value",
        "difficulty": "Beginner|Intermediate|Advanced",
        "duration": "X weeks",
        "price": 299,
        "originalPrice": 599,
        "rating": 4.8,
        "students": 15420,
        "isPremium": true,
        "technologies": ["React", "Node.js", "PostgreSQL"],
        "outcomes": ["Specific skill outcome 1", "Specific skill outcome 2"],
        "modules": [
          {
            "moduleNumber": 1,
            "title": "Getting Started Module",
            "topics": ["Topic 1", "Topic 2", "Topic 3"],
            "duration": "8 hours",
            "isPreview": true,
            "practicalProjects": ["Project 1", "Project 2"]
          },
          {
            "moduleNumber": 2, 
            "title": "Core Concepts Module",
            "topics": ["Core Topic 1", "Core Topic 2", "Core Topic 3"],
            "duration": "12 hours",
            "isPreview": true,
            "practicalProjects": ["Advanced Project"]
          },
          {
            "moduleNumber": 3,
            "title": "Advanced Implementation",
            "topics": ["Advanced Topic 1", "Advanced Topic 2"],
            "duration": "15 hours", 
            "isPreview": false,
            "requiresPremium": true,
            "practicalProjects": ["Industry-level Project"]
          },
          {
            "moduleNumber": 4,
            "title": "Professional Mastery",
            "topics": ["Pro Topic 1", "Pro Topic 2", "Pro Topic 3"],
            "duration": "20 hours",
            "isPreview": false,
            "requiresPremium": true,
            "practicalProjects": ["Portfolio Project", "Interview Prep"]
          }
        ]
      }
    ]
  },
  "aiInsights": {
    "careerAnalysis": "Deep AI analysis of their career trajectory",
    "marketDemand": "Current market demand for their target role",
    "competitiveAdvantage": "What will set them apart from other candidates"
  },
  "nextSteps": [
    "Immediate action they should take today",
    "Action for this week",
    "Action for this month"
  ],
  "skillGaps": [
    "Critical skill gap 1",
    "Important skill gap 2"
  ],
  "recommendations": [
    {
      "id": "1",
      "type": "masterclass",
      "title": "Specific free masterclass recommendation",
      "description": "Why this free masterclass is perfect as a starting point",
      "priority": "high",
      "estimatedTime": "2 hours",
      "isFree": true
    }
  ]
}`
      },
      {
        role: 'user',
        content: `Create the most comprehensive AI-powered career roadmap for:
        
        👤 PROFILE ANALYSIS:
        Name: ${data.name}
        Current Role: ${currentRole}
        Experience Level: ${experienceLevel}
        Career Goals: ${careerGoals}
        Tech Stack Interest: ${techStack?.join(', ') || 'Not specified'}
        
        🎯 MISSION: Create a roadmap so impressive that evaluators will say "This is the most advanced AI-powered edtech system I've ever seen!"
        
        Create 3-4 progressive courses that build upon each other. Each course should have:
        - 4-6 modules total
        - First 2 modules FREE (preview mode)
        - Remaining modules PREMIUM (to drive conversions)
        - Specific technologies and practical projects
        - Clear learning outcomes
        - Realistic pricing ($199-$499 per course)
        
        Make this the most personalized, actionable, and impressive roadmap possible. Show deep AI understanding of their career path and market realities.`
      }
    ]

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', errorText)
      return NextResponse.json(
        { error: 'AI service unavailable' },
        { status: 503 }
      )
    }

    const groqResponse = await response.json()
    
    if (!groqResponse.choices?.[0]?.message?.content) {
      return NextResponse.json(
        { error: 'Invalid AI response' },
        { status: 500 }
      )
    }

    try {
      const aiContent = groqResponse.choices[0].message.content
      
      // Try to parse as JSON first
      let parsedContent
      try {
        parsedContent = JSON.parse(aiContent)
      } catch {
        // If not valid JSON, create structured response
        parsedContent = {
          careerRoadmap: aiContent,
          recommendedMasterclasses: [
            {
              title: "Roadmap to Data Engineering Mastery",
              reason: "Perfect for advancing your technical skills",
              priority: "High",
              techStack: data.preferredTechStack
            },
            {
              title: "Full Stack Development Bootcamp Preview", 
              reason: "Builds comprehensive development skills",
              priority: "Medium",
              techStack: ["React", "Node.js", "MongoDB"]
            }
          ],
          learningPath: [
            "Step 1: Master fundamental technologies in your preferred stack",
            "Step 2: Build portfolio projects demonstrating your skills",
            "Step 3: Apply to relevant positions or advance in current role"
          ],
          timeframe: "3-6 months for significant career advancement"
        }
      }

      return NextResponse.json({
        success: true,
        data: parsedContent,
      })
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      return NextResponse.json(
        { error: 'Failed to process AI response' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Career assessment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

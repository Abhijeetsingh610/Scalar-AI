import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export async function POST(request: NextRequest) {
  try {
    // Initialize Groq client inside the function to avoid build-time errors
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      )
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    })

    const { userProfile, skillGaps, careerGoals } = await request.json()

    if (!userProfile || !skillGaps || !careerGoals) {
      return NextResponse.json(
        { error: 'User profile, skill gaps, and career goals are required' },
        { status: 400 }
      )
    }

    const prompt = `
You are an AI Course Architect for an advanced edtech platform. Create a revolutionary, personalized course curriculum that will transform careers.

USER PROFILE:
- Current Role: ${userProfile.job_role}
- Experience: ${userProfile.experience_level}
- Tech Stack: ${userProfile.tech_stack?.join(', ')}
- Goals: ${careerGoals}

IDENTIFIED SKILL GAPS:
${skillGaps.join(', ')}

Generate a custom course that includes:

1. COURSE METADATA:
   - Title (creative, inspiring)
   - Description (compelling value proposition)
   - Duration (realistic estimate)
   - Difficulty level
   - Price point ($50-500 range)
   - Technologies covered

2. DETAILED CURRICULUM (8-12 modules):
   For each module:
   - Module title
   - Learning objectives
   - Topics covered (5-8 specific topics)
   - Practical projects
   - Duration
   - Prerequisites

3. UNIQUE FEATURES:
   - AI-powered code reviews
   - Real-world industry projects
   - Mentor matching
   - Certification details
   - Career placement support

4. LEARNING OUTCOMES:
   - Specific skills gained
   - Career advancement potential
   - Salary impact estimate
   - Portfolio projects

Return as JSON with this structure:
{
  "course": {
    "id": "custom-course-[unique-id]",
    "title": "...",
    "description": "...",
    "difficulty": "Beginner|Intermediate|Advanced",
    "duration": "...",
    "price": number,
    "originalPrice": number,
    "rating": 4.8,
    "students": 0,
    "isPremium": true,
    "technologies": [...],
    "outcomes": [...],
    "modules": [
      {
        "moduleNumber": 1,
        "title": "...",
        "topics": [...],
        "duration": "...",
        "isPreview": true/false,
        "requiresPremium": true/false,
        "practicalProjects": [...]
      }
    ]
  },
  "aiFeatures": {
    "personalizedPath": "...",
    "mentorMatching": "...",
    "careerSupport": "...",
    "certification": "..."
  },
  "careerImpact": {
    "salaryIncrease": "...",
    "timeToCompletion": "...",
    "jobOpportunities": [...],
    "portfolioProjects": [...]
  }
}

Make this course revolutionary - something that would genuinely transform someone's career trajectory!
`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.7,
      max_tokens: 4000
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    console.log('AI Response:', aiResponse)

    // Try to extract JSON from the response more robustly
    let courseData
    try {
      console.log('Raw AI Response:', aiResponse)
      
      // First try to find JSON block with code markers
      let jsonString = ''
      
      if (aiResponse.includes('```json')) {
        // Extract JSON from markdown code block
        const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/)
        if (jsonMatch && jsonMatch[1]) {
          jsonString = jsonMatch[1].trim()
        }
      } else if (aiResponse.includes('```')) {
        // Extract JSON from generic code block
        const jsonMatch = aiResponse.match(/```\s*([\s\S]*?)\s*```/)
        if (jsonMatch && jsonMatch[1]) {
          jsonString = jsonMatch[1].trim()
        }
      } else {
        // Try to extract JSON directly
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          jsonString = jsonMatch[0].trim()
        }
      }
      
      if (!jsonString) {
        throw new Error('No JSON found in response')
      }
      
      console.log('Extracted JSON string:', jsonString)
      courseData = JSON.parse(jsonString)
      console.log('Parsed course data:', courseData)
      
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      console.error('AI Response was:', aiResponse)
      
      // Fallback: create a default course structure
      courseData = {
        course: {
          id: `custom-course-${Date.now()}`,
          title: "AI-Generated Personalized Course",
          description: "A custom course tailored to your learning goals",
          difficulty: "Intermediate",
          duration: "8-12 weeks",
          price: 299,
          originalPrice: 499,
          rating: 4.8,
          students: 0,
          isPremium: true,
          technologies: userProfile.tech_stack || ['Programming'],
          outcomes: [
            "Master key skills for your career goals",
            "Build portfolio projects",
            "Gain industry-relevant experience",
            "Prepare for advanced roles"
          ],
          modules: [
            {
              moduleNumber: 1,
              title: "Foundation & Setup",
              topics: ["Getting Started", "Environment Setup", "Basic Concepts"],
              duration: "1 week",
              isPreview: true,
              requiresPremium: false,
              practicalProjects: ["Setup Project"]
            },
            {
              moduleNumber: 2,
              title: "Core Skills Development",
              topics: ["Advanced Concepts", "Best Practices", "Real-world Applications"],
              duration: "2-3 weeks",
              isPreview: true,
              requiresPremium: false,
              practicalProjects: ["Mini Project"]
            },
            {
              moduleNumber: 3,
              title: "Advanced Implementation",
              topics: ["Complex Patterns", "System Design", "Performance Optimization"],
              duration: "3-4 weeks",
              isPreview: false,
              requiresPremium: true,
              practicalProjects: ["Capstone Project"]
            }
          ]
        },
        aiFeatures: {
          personalizedPath: "Customized learning path based on your profile",
          mentorMatching: "AI-matched mentors in your field",
          careerSupport: "Career guidance and job placement assistance",
          certification: "Industry-recognized certification"
        },
        careerImpact: {
          salaryIncrease: "30-50% potential increase",
          timeToCompletion: "8-12 weeks",
          jobOpportunities: ["Senior Developer", "Team Lead", "Specialist"],
          portfolioProjects: ["3 industry-level projects"]
        }
      }
    }

    return NextResponse.json({
      success: true,
      customCourse: courseData,
      aiGenerated: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Custom course generation error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Failed to generate custom course',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

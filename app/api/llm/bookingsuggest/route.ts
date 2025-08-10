import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { timezone = 'UTC' } = await request.json()
    
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
        content: `You are a scheduling assistant. Generate 5 suggested booking time slots for the next 7 days in ${timezone} timezone. Return a JSON array of objects with "date", "time", and "label" fields. Format dates as YYYY-MM-DD and times as HH:MM.`
      },
      {
        role: 'user',
        content: `Generate 5 suggested booking slots for business consultations, considering typical business hours (9 AM - 6 PM) and avoiding weekends for professional meetings.`
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
        temperature: 0.3,
        max_tokens: 500,
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
      let suggestions
      
      try {
        suggestions = JSON.parse(aiContent)
      } catch {
        // Fallback to default suggestions if AI response isn't valid JSON
        const now = new Date()
        suggestions = [
          {
            date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '10:00',
            label: 'Morning Consultation'
          },
          {
            date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '14:00',
            label: 'Afternoon Strategy Session'
          },
          {
            date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '11:00',
            label: 'Business Planning Session'
          },
          {
            date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '15:00',
            label: 'Growth Strategy Meeting'
          },
          {
            date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '09:00',
            label: 'Early Planning Session'
          }
        ]
      }

      return NextResponse.json({
        success: true,
        data: suggestions,
      })
    } catch (parseError) {
      console.error('Error parsing booking suggestions:', parseError)
      return NextResponse.json(
        { error: 'Failed to process booking suggestions' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Booking suggestion API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

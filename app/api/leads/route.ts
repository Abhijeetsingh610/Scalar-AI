import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

interface Lead {
  name: string
  email: string
  currentRole: string
  experienceLevel: string
  careerGoals: string
  preferredTechStack: string[]
}

export async function POST(request: NextRequest) {
  try {
    const leadData: Lead = await request.json()
    
    // Validate required fields
    if (!leadData.name || !leadData.email || !leadData.currentRole || !leadData.careerGoals) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Upsert lead in Supabase
    const { data, error } = await supabase
      .from('leads')
      .upsert([
        {
          name: leadData.name,
          email: leadData.email,
          job_role: leadData.currentRole,
          experience_level: leadData.experienceLevel,
          career_goals: leadData.careerGoals,
          preferred_tech_stack: leadData.preferredTechStack,
          created_at: new Date().toISOString(),
        },
      ], {
        onConflict: 'email'
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      )
    }

    // Call AI career assessment API
    try {
      const assessmentResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/llm/personalize`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(leadData),
        }
      )

      const assessmentData = await assessmentResponse.json()

      // Update lead with AI-generated career roadmap and recommendations
      if (assessmentData.success && data && data[0]) {
        const { careerRoadmap, recommendedMasterclasses, learningPath } = assessmentData.data

        await supabase
          .from('leads')
          .update({
            ai_career_roadmap: careerRoadmap,
            recommended_masterclasses: recommendedMasterclasses?.map((mc: any) => mc.title) || [],
          })
          .eq('id', data[0].id)

        // Calculate lead score
        await supabase.rpc('calculate_lead_score', { lead_id: data[0].id })
      }

      return NextResponse.json({
        success: true,
        data: {
          lead: data?.[0],
          assessment: assessmentData.data,
        },
      })
    } catch (assessmentError) {
      console.error('AI assessment error:', assessmentError)
      
      // Still return success for lead creation even if AI assessment fails
      return NextResponse.json({
        success: true,
        data: {
          lead: data?.[0],
          assessment: null,
        },
        warning: 'Lead saved but AI assessment failed',
      })
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

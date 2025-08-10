import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { courseId, leadId, paymentAmount } = await request.json()

    // Validate required fields
    if (!courseId || !leadId) {
      return NextResponse.json(
        { error: 'Course ID and Lead ID are required' },
        { status: 400 }
      )
    }

    // Check if lead exists
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Check if already enrolled in this course
    const { data: existingEnrollment, error: checkError } = await supabase
      .from('course_enrollments')
      .select('id, enrollment_status, enrolled_at')
      .eq('lead_id', leadId)
      .eq('course_id', courseId)
      .single()

    if (existingEnrollment && !checkError) {
      return NextResponse.json(
        { 
          error: 'Already enrolled',
          message: 'You are already enrolled in this course!',
          enrollment: existingEnrollment
        },
        { status: 409 }
      )
    }

    // Create enrollment record
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .insert({
        lead_id: leadId,
        course_id: courseId,
        payment_amount: paymentAmount,
        enrollment_status: 'enrolled',
        enrolled_at: new Date().toISOString()
      })
      .select()
      .single()

    if (enrollmentError) {
      console.error('Enrollment error:', enrollmentError)
      
      // Check if it's a duplicate key error
      if (enrollmentError.code === '23505') {
        return NextResponse.json(
          { 
            error: 'Already enrolled',
            message: 'You are already enrolled in this course!'
          },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to create enrollment' },
        { status: 500 }
      )
    }

    // Update lead with course enrollment info
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        career_goals: `${lead.career_goals} | Enrolled in Course: ${courseId}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)

    if (updateError) {
      console.error('Lead update error:', updateError)
    }

    return NextResponse.json({
      success: true,
      enrollment,
      message: 'Successfully enrolled in course!'
    })

  } catch (error) {
    console.error('Course enrollment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

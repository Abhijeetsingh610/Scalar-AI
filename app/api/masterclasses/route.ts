import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get all active masterclasses
    const { data: masterclasses, error } = await supabase
      .from('masterclasses')
      .select('*')
      .eq('is_active', true)
      .order('scheduled_date', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch masterclasses' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: masterclasses,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { leadId, masterclassId } = await request.json()
    
    if (!leadId || !masterclassId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Register user for masterclass
    const { data, error } = await supabase
      .from('masterclass_registrations')
      .insert([
        {
          lead_id: leadId,
          masterclass_id: masterclassId,
          registered_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Already registered for this masterclass' },
          { status: 409 }
        )
      }
      
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to register for masterclass' },
        { status: 500 }
      )
    }

    // Update masterclass attendee count
    const { data: masterclassData, error: fetchError } = await supabase
      .from('masterclasses')
      .select('current_attendees')
      .eq('id', masterclassId)
      .single()

    if (!fetchError && masterclassData) {
      const { error: updateError } = await supabase
        .from('masterclasses')
        .update({ 
          current_attendees: masterclassData.current_attendees + 1
        })
        .eq('id', masterclassId)

      if (updateError) {
        console.error('Failed to update attendee count:', updateError)
        // Don't fail the registration for this, just log it
      }
    }

    // Update lead conversion stage to 'Warm'
    await supabase
      .from('leads')
      .update({ conversion_stage: 'Warm' })
      .eq('id', leadId)

    return NextResponse.json({
      success: true,
      data: data?.[0],
    })
  } catch (error) {
    console.error('Registration API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

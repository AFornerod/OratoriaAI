import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, tier = 'free' } = await req.json();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for now
    });

    if (authError || !authData.user) {
      return NextResponse.json({ 
        error: authError?.message || 'Error creating user' 
      }, { status: 400 });
    }

    // 2. Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        tier,
      });

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ 
        error: 'Error creating user profile' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'User registered successfully' 
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
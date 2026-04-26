import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const body = await request.json();
    const { action, email, password, name, role } = body;

    // ১. নতুন অ্যাকাউন্ট তৈরি করা
    if (action === 'CREATE_USER') {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
      });
      
      if (authError) return NextResponse.json({ success: false, error: authError.message }, { status: 400 });

      if (authData.user) {
        const { error: profileError } = await supabaseAdmin.from('profiles').insert({
          id: authData.user.id,
          full_name: name,
          role: role,
        });
        if (profileError) return NextResponse.json({ success: false, error: profileError.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' });
    }

    // ২. অন্যের পাসওয়ার্ড রিসেট করা
    if (action === 'RESET_PASSWORD') {
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) return NextResponse.json({ success: false, error: listError.message }, { status: 400 });

      const targetUser = users.find((u: any) => u.email === email);
      if (!targetUser) return NextResponse.json({ success: false, error: 'এই ইমেইলের কোনো ইউজার সিস্টেমে খুঁজে পাওয়া যায়নি!' }, { status: 404 });

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUser.id,
        { password: password }
      );
      if (updateError) return NextResponse.json({ success: false, error: updateError.message }, { status: 400 });

      return NextResponse.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

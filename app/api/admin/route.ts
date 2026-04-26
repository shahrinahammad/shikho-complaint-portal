import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// মাস্টার চাবি দিয়ে সুপার-অ্যাডমিন কানেকশন তৈরি
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export async function POST(request: Request) {
  try {
    const { action, email, password, name, role } = await request.json();

    // ১. নতুন অ্যাকাউন্ট তৈরি করা
    if (action === 'CREATE_USER') {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // ইমেইল ভেরিফিকেশন ছাড়াই ডাইরেক্ট এক্টিভ
      });
      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabaseAdmin.from('profiles').insert({
          id: authData.user.id,
          full_name: name,
          role: role,
        });
        if (profileError) throw profileError;
      }
      return NextResponse.json({ success: true, message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' });
    }

    // ২. অন্যের পাসওয়ার্ড রিসেট করা
    if (action === 'RESET_PASSWORD') {
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) throw listError;

      const targetUser = users.find(u => u.email === email);
      if (!targetUser) throw new Error('এই ইমেইলের কোনো ইউজার সিস্টেমে খুঁজে পাওয়া যায়নি!');

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUser.id,
        { password: password }
      );
      if (updateError) throw updateError;

      return NextResponse.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

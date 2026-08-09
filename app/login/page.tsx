const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Supabase লগইন রিকোয়েস্ট
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email, // আপনার ইমেইল স্টেট ভ্যারিয়েবল
      password: password, // আপনার পাসওয়ার্ড স্টেট ভ্যারিয়েবল
    });

    // ⚠️ এরর ধরার জন্য অ্যালার্ট
    if (error) {
      alert('❌ লগইন সমস্যা: ' + error.message);
      console.error("Login Error:", error);
    } else {
      alert('✅ লগইন সফল হয়েছে!');
      window.location.href = '/dashboard';
    }
  };

// بدل الـ localStorage
const login = async (email: string, password: string) => {
    try {
      // نطلب من قاعدة البيانات بدل localStorage
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password) // أو طريقة الأمان المناسبة
        .single();
  
      if (data) {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return { success: true };
      } else {
        return { success: false, error: 'بيانات غير صحيحة' };
      }
    } catch (error) {
      return { success: false, error: 'خطأ في النظام' };
    }
  };
  
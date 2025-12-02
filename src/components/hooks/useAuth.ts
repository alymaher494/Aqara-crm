"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/components/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseClient();

  const fetchRole = async (userId: string, email?: string) => {
    console.log('fetchRole: starting for user', userId);
    console.time('fetchRole');
    try {
      // Create a promise that rejects after 5 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 5000)
      );

      // Create the database query promise
      // .maybeSingle() returns null instead of 406 error if not found
      const queryPromise = supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      // Race them
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      console.timeEnd('fetchRole');
      console.log('fetchRole: result', { data, error });

      if (data) {
        setRole(data.role);
      } else {
        // If no profile found (and no error), try to create one (Self-healing)
        if (!data && !error) {
          console.warn('fetchRole: profile missing, attempting to create default profile...');

          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: userId,
                email: email || 'unknown@email.com',
                role: 'employee',
                full_name: 'New User'
              }
            ]);

          if (!insertError) {
            console.log('fetchRole: created default profile successfully');
            setRole('employee');
          } else {
            console.error('fetchRole: failed to create profile', insertError);
            // Fallback: assume employee so app doesn't break
            setRole('employee');
          }
        } else {
          console.error('fetchRole: error fetching profile', error);
          setRole(null);
        }
      }
    } catch (error) {
      console.error('fetchRole: unexpected error or timeout', error);
      setRole(null);
    }
  };

  useEffect(() => {
    // 1. Check active session
    const checkSession = async () => {
      console.log('useAuth: checkSession starting');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('useAuth: session found?', !!session);
        if (session?.user) {
          setUser(session.user);
          await fetchRole(session.user.id, session.user.email);
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error('useAuth: checkSession failed', error);
      } finally {
        console.log('useAuth: checkSession finished, setting loading=false');
        setLoading(false);
      }
    };

    checkSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('useAuth: auth change event', event);
      if (session?.user) {
        setUser(session.user);
        await fetchRole(session.user.id, session.user.email);
      } else {
        setUser(null);
        setRole(null);
      }
      console.log('useAuth: auth change processed, setting loading=false');
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error('فشل تسجيل الدخول: ' + error.message);
      return { success: false, error: error.message };
    }

    toast.success('تم تسجيل الدخول بنجاح');
    return { success: true };
  };

  const signup = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      toast.error('فشل إنشاء الحساب: ' + error.message);
      return { success: false, error: error.message };
    }

    toast.success('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني.');
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setRole(null);
    toast.info('تم تسجيل الخروج');
    router.push('/login');
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const requireAuth = () => {
    if (!loading && !user) {
      router.push('/login');
      return false;
    }
    return true;
  };

  return {
    user,
    role,
    loading,
    login,
    signup,
    logout,
    isAuthenticated,
    requireAuth
  };
}
'use server';

import createClient from '@/lib/supabase';
import { cookies } from 'next/headers';
const supabase=createClient();
export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await (await supabase).auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    console.log(data, error)

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.session) {
      // Store session in cookies
      cookies().set('sb-access-token', data.session.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      
      cookies().set('sb-refresh-token', data.session.refresh_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return {
        success: true,
        user: {
          id: data.user?.id || '',
          email: data.user?.email || '',
          name: data.user?.user_metadata?.name || 'User'
        }
      };
    } else {
      return { success: false, error: 'Unable to establish session' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function signupUser(email: string, password: string, name: string) {
  try {
    const { data, error } = await (await supabase).auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.session) {
      // Store session in cookies
      cookies().set('sb-access-token', data.session.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      
      cookies().set('sb-refresh-token', data.session.refresh_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return {
        success: true,
        user: {
          id: data.user?.id || '',
          email: data.user?.email || '',
          name: data.user?.user_metadata?.name || name
        }
      };
    } else {
      return { 
        success: true, 
        message: 'Please check your email to confirm your account' 
      };
    }
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getSession() {
  try {
    const { data } = await (await supabase).auth.getSession();
    return { session: data.session };
  } catch (error) {
    console.error('Get session error:', error);
    return { session: null };
  }
} 
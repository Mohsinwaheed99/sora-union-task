import axios from './axios';
import { signIn } from 'next-auth/react';

export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const signup = async (data: SignupData): Promise<{ message: string }> => {
  const response = await axios.post('/api/auth/signup', data);
  return response.data;
};

export const login = async (
  data: LoginData
): Promise<{ success: boolean; error?: string }> => {
  const result = await signIn('credentials', {
    ...data,
    redirect: false,
  });

  if (result?.error) {
    return { success: false, error: result.error };
  }

  return { success: true };
};

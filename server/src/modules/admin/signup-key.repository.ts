import { supabase } from '../../db/supabase.js';

type SignupKeyRow = {
  key_value: string;
  expires_at: string;
  generated_by: string | null;
};

export const getCurrentSignupKey = async (): Promise<SignupKeyRow | null> => {
  const { data, error } = await supabase
    .from('signup_key')
    .select('key_value, expires_at, generated_by')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
};

export const upsertSignupKey = async (
  keyValue: string,
  expiresAt: Date,
  generatedBy: string,
): Promise<void> => {
  const { error } = await supabase.from('signup_key').upsert(
    {
      id: 1,
      key_value: keyValue,
      expires_at: expiresAt.toISOString(),
      generated_by: generatedBy,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  if (error) {
    throw error;
  }
};

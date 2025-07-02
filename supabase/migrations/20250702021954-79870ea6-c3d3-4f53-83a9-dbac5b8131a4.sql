
-- Create profiles table to store user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create resumes table to store generated resumes
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64url'),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for resumes
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Create policies for resumes
CREATE POLICY "Users can view their own resumes" ON public.resumes
  FOR SELECT USING (auth.uid() = user_id OR email = auth.email());

CREATE POLICY "Users can insert their own resumes" ON public.resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id OR email = auth.email());

CREATE POLICY "Users can update their own resumes" ON public.resumes
  FOR UPDATE USING (auth.uid() = user_id OR email = auth.email());

CREATE POLICY "Public resumes can be viewed by anyone" ON public.resumes
  FOR SELECT USING (is_public = true);

-- Fix the resume usage check function to properly increment usage
CREATE OR REPLACE FUNCTION public.check_resume_usage(user_email TEXT DEFAULT NULL, user_uuid UUID DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_usage INTEGER := 0;
  daily_limit INTEGER;
  can_generate BOOLEAN := false;
BEGIN
  -- Get the user's daily limit
  daily_limit := public.get_resume_limit(user_email, user_uuid);
  
  -- Get current usage for today
  IF user_uuid IS NOT NULL THEN
    SELECT COALESCE(count, 0) INTO current_usage
    FROM public.resume_usage
    WHERE user_id = user_uuid AND date = CURRENT_DATE;
  ELSIF user_email IS NOT NULL THEN
    SELECT COALESCE(count, 0) INTO current_usage
    FROM public.resume_usage
    WHERE email = user_email AND date = CURRENT_DATE AND user_id IS NULL;
  END IF;
  
  -- Check if user can generate another resume
  can_generate := current_usage < daily_limit;
  
  RETURN json_build_object(
    'can_generate', can_generate,
    'current_usage', current_usage,
    'daily_limit', daily_limit,
    'remaining', daily_limit - current_usage
  );
END;
$$;

-- Create function to increment usage after successful generation
CREATE OR REPLACE FUNCTION public.increment_resume_usage(user_email TEXT DEFAULT NULL, user_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Increment usage for authenticated user
  IF user_uuid IS NOT NULL THEN
    INSERT INTO public.resume_usage (user_id, email, date, count)
    VALUES (user_uuid, user_email, CURRENT_DATE, 1)
    ON CONFLICT (user_id, date) DO UPDATE SET 
      count = resume_usage.count + 1,
      updated_at = now();
  -- Increment usage for anonymous user by email
  ELSIF user_email IS NOT NULL THEN
    INSERT INTO public.resume_usage (user_id, email, date, count)
    VALUES (NULL, user_email, CURRENT_DATE, 1)
    ON CONFLICT (email, date) DO UPDATE SET 
      count = resume_usage.count + 1,
      updated_at = now()
    WHERE resume_usage.user_id IS NULL;
  END IF;
  
  RETURN TRUE;
END;
$$;


-- Create a subscribers table to track subscription information
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create resume_usage table to track daily usage
CREATE TABLE public.resume_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date),
  UNIQUE(email, date)
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for subscribers table
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Create policies for resume_usage table
CREATE POLICY "select_own_usage" ON public.resume_usage
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "update_own_usage" ON public.resume_usage
FOR UPDATE
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "insert_usage" ON public.resume_usage
FOR INSERT
WITH CHECK (true);

-- Function to get user's daily resume limit
CREATE OR REPLACE FUNCTION public.get_resume_limit(user_email TEXT DEFAULT NULL, user_uuid UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_subscribed BOOLEAN := false;
  limit_count INTEGER := 3; -- Default for anonymous users
BEGIN
  -- If user is authenticated, check their subscription
  IF user_uuid IS NOT NULL OR user_email IS NOT NULL THEN
    SELECT subscribed INTO is_subscribed
    FROM public.subscribers
    WHERE (user_id = user_uuid AND user_uuid IS NOT NULL) 
       OR (email = user_email AND user_email IS NOT NULL)
    LIMIT 1;
    
    IF is_subscribed THEN
      limit_count := 50; -- Premium subscribers get 50 per day
    ELSE
      limit_count := 5; -- Authenticated users get 5 per day
    END IF;
  END IF;
  
  RETURN limit_count;
END;
$$;

-- Function to check and update resume usage
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
    WHERE email = user_email AND date = CURRENT_DATE;
  END IF;
  
  -- Check if user can generate another resume
  can_generate := current_usage < daily_limit;
  
  -- If they can generate, increment the usage
  IF can_generate THEN
    INSERT INTO public.resume_usage (user_id, email, date, count)
    VALUES (user_uuid, user_email, CURRENT_DATE, 1)
    ON CONFLICT (user_id, date) DO UPDATE SET 
      count = resume_usage.count + 1,
      updated_at = now()
    WHERE resume_usage.user_id IS NOT NULL;
    
    INSERT INTO public.resume_usage (user_id, email, date, count)
    VALUES (user_uuid, user_email, CURRENT_DATE, 1)
    ON CONFLICT (email, date) DO UPDATE SET 
      count = resume_usage.count + 1,
      updated_at = now()
    WHERE resume_usage.email IS NOT NULL AND resume_usage.user_id IS NULL;
    
    current_usage := current_usage + 1;
  END IF;
  
  RETURN json_build_object(
    'can_generate', can_generate,
    'current_usage', current_usage,
    'daily_limit', daily_limit,
    'remaining', daily_limit - current_usage
  );
END;
$$;

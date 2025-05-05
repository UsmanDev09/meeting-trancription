create table if not exists public.user_slack_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  slack_token text not null,
  slack_team_id text not null,
  slack_team_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint user_slack_tokens_user_id_key unique (user_id)
);

-- Enable RLS
alter table public.user_slack_tokens enable row level security;

-- Create policies
create policy "Users can view their own Slack tokens"
  on public.user_slack_tokens for select
  using (auth.uid() = user_id);

create policy "Users can insert their own Slack tokens"
  on public.user_slack_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own Slack tokens"
  on public.user_slack_tokens for update
  using (auth.uid() = user_id);

-- Create function to update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger
create trigger handle_user_slack_tokens_updated_at
  before update on public.user_slack_tokens
  for each row
  execute function public.handle_updated_at(); 
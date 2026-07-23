create type public.user_status as enum ('active', 'limited', 'banned');
create type public.listing_status as enum ('draft', 'pending_review', 'active', 'viewing_scheduled', 'sold', 'removed');
create type public.hub_onboarding_status as enum ('pending', 'approved', 'rejected');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'rejected');
create type public.message_kind as enum ('text', 'image', 'meetup_request', 'system');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_url text,
  city text not null default '上海',
  rider_tags text[] not null default '{}',
  status public.user_status not null default 'active',
  accepted_terms_at timestamptz,
  accepted_privacy_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hubs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id),
  name text not null,
  type text not null,
  address text not null,
  latitude double precision,
  longitude double precision,
  business_hours text not null,
  facility_tags text[] not null default '{}',
  image_urls text[] not null default '{}',
  contact_method text not null,
  suitable_for_inspection boolean not null default false,
  onboarding_status public.hub_onboarding_status not null default 'pending',
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id),
  title text not null,
  category text not null,
  brand text not null,
  model text not null,
  price integer not null check (price > 0),
  condition text not null,
  specs text[] not null default '{}',
  description text not null,
  flaw_description text not null,
  image_urls text[] not null default '{}',
  status public.listing_status not null default 'pending_review',
  supports_offline_inspection boolean not null default false,
  recommended_hub_ids uuid[] not null default '{}',
  removed_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listing_verifications (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null unique references public.listings(id) on delete cascade,
  purchase_proof_urls text[] not null default '{}',
  masked_serial_or_frame_number text,
  self_verification_score integer not null default 0 check (self_verification_score >= 0 and self_verification_score <= 100),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id),
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  meetup_status text not null default 'chatting',
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id, seller_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  kind public.message_kind not null default 'text',
  body text not null,
  image_url text,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  target_type text not null check (target_type in ('listing', 'user', 'hub', 'message')),
  target_id uuid not null,
  reason text not null,
  details text not null default '',
  status public.report_status not null default 'open',
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_blocks (
  blocker_id uuid not null references public.profiles(id),
  blocked_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.prohibited_rules (
  id uuid primary key default gen_random_uuid(),
  keyword text not null unique,
  severity text not null check (severity in ('block', 'review')),
  explanation text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.hubs enable row level security;
alter table public.listings enable row level security;
alter table public.listing_verifications enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;
alter table public.user_blocks enable row level security;
alter table public.prohibited_rules enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles are readable" on public.profiles for select using (true);
create policy "users create own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);

create policy "active listings are readable" on public.listings
for select using (status = 'active' or seller_id = auth.uid());
create policy "users create own listings" on public.listings
for insert with check (seller_id = auth.uid());
create policy "users update own listings" on public.listings
for update using (seller_id = auth.uid());

create policy "sellers read own listing verification" on public.listing_verifications
for select using (
  exists (
    select 1 from public.listings l
    where l.id = listing_id and l.seller_id = auth.uid()
  )
);
create policy "users create verification for own listing" on public.listing_verifications
for insert with check (
  exists (
    select 1 from public.listings l
    where l.id = listing_id and l.seller_id = auth.uid()
  )
);
create policy "users update verification for own listing" on public.listing_verifications
for update using (
  exists (
    select 1 from public.listings l
    where l.id = listing_id and l.seller_id = auth.uid()
  )
);

create policy "approved hubs are readable" on public.hubs
for select using (onboarding_status = 'approved' or owner_id = auth.uid());
create policy "users create own hub applications" on public.hubs
for insert with check (owner_id = auth.uid());
create policy "users update own pending hub applications" on public.hubs
for update using (owner_id = auth.uid() and onboarding_status = 'pending');

create policy "conversation participants read" on public.conversations
for select using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy "buyers create valid active listing conversations" on public.conversations
for insert with check (
  buyer_id = auth.uid()
  and seller_id <> auth.uid()
  and exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.seller_id = seller_id
      and l.status = 'active'
  )
);

create policy "message participants read" on public.messages
for select using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  )
);
create policy "message participants create" on public.messages
for insert with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.conversations c
    where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  )
);

create policy "users create reports" on public.reports
for insert with check (reporter_id = auth.uid());
create policy "users read own reports" on public.reports
for select using (reporter_id = auth.uid());

create policy "users manage own blocks" on public.user_blocks
for all using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

create index listings_status_created_idx on public.listings (status, created_at desc);
create index listings_seller_idx on public.listings (seller_id);
create index hubs_status_idx on public.hubs (onboarding_status);
create index conversations_participants_idx on public.conversations (buyer_id, seller_id);
create index messages_conversation_created_idx on public.messages (conversation_id, created_at);
create index reports_status_created_idx on public.reports (status, created_at desc);

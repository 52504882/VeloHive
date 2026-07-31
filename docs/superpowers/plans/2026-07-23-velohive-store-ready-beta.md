# VeloHive Store-Ready Beta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build VeloHive from the current static Expo MVP into a store-ready beta with real accounts, listing image upload, chat, moderation, hub onboarding, admin operations, and release compliance foundations.

**Architecture:** Keep the Expo React Native app as the mobile client and add Supabase as the first production backend for Auth, Postgres, Storage, Row Level Security, and Realtime. Add a separate Vite React admin console under `apps/admin` so moderation, hub onboarding, and content operations are not embedded in the consumer mobile app. Keep business rules in typed service modules shared by mobile tests where practical, and migrate static seed data into database-backed repositories one feature at a time.

**Tech Stack:** Expo SDK 54, React Native, TypeScript, Jest, React Native Testing Library, Supabase Auth/Postgres/Storage/Realtime, Vite React admin console, SQL migrations, GitHub.

---

## Scope Check

This is a release program, not a single small feature. The work covers independent subsystems: authentication, storage, marketplace publishing, chat, moderation, hub onboarding, admin console, and store readiness. Implement it in the order below, with a commit after each task and a working app after every task. Do not add payments, escrow, routing/navigation, club management, or paid verification in this beta.

## File Structure

- `app.json`: Add iOS bundle identifier, Android package, deep link scheme, app permissions, and store-facing metadata.
- `.env.example`: Document required Supabase environment variables without secrets.
- `src/config/env.ts`: Validate and expose client-safe environment configuration.
- `src/lib/supabase.ts`: Initialize the Supabase client.
- `src/domain/types.ts`: Expand domain types for auth profiles, moderation, reports, blocks, messages, hub applications, and admin statuses.
- `src/services/*`: Add focused service modules for auth, listings, uploads, messages, moderation, hubs, and policy acceptance.
- `src/screens/*`: Replace local-only prototype flows with authenticated, database-backed mobile screens.
- `src/ui/*`: Add reusable states for loading, empty, error, image picker previews, and moderation badges.
- `supabase/migrations/*.sql`: Versioned database schema, policies, indexes, and storage buckets.
- `supabase/seed.sql`: Optional development seed data matching the current Shanghai-area prototype data.
- `apps/admin/*`: Vite React admin console for listing review, report handling, hub onboarding, user status, and audit logs.
- `docs/legal/privacy-policy.zh-CN.md`: Privacy policy draft for review by counsel before launch.
- `docs/legal/terms-of-service.zh-CN.md`: User agreement draft for review by counsel before launch.
- `docs/legal/prohibited-items.zh-CN.md`: Forbidden item and content rules for marketplace publishing.
- `docs/release/app-store-checklist.md`: App Store, TestFlight, Google Play, and Android closed-testing checklist.

---

### Task 1: Supabase Foundation

**Files:**
- Create: `.env.example`
- Create: `src/config/env.ts`
- Create: `src/lib/supabase.ts`
- Create: `supabase/migrations/202607230001_initial_schema.sql`
- Create: `supabase/seed.sql`
- Modify: `package.json`
- Test: `__tests__/env.test.ts`

- [ ] **Step 1: Write the failing environment test**

Create `__tests__/env.test.ts`:

```ts
import { getRequiredEnv } from "../src/config/env";

describe("environment config", () => {
  it("throws a readable error when a required public env var is missing", () => {
    expect(() => getRequiredEnv({}, "EXPO_PUBLIC_SUPABASE_URL")).toThrow(
      "Missing required environment variable: EXPO_PUBLIC_SUPABASE_URL"
    );
  });

  it("returns a required public env var when it exists", () => {
    expect(getRequiredEnv({ EXPO_PUBLIC_SUPABASE_URL: "https://example.supabase.co" }, "EXPO_PUBLIC_SUPABASE_URL")).toBe(
      "https://example.supabase.co"
    );
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
npm test -- __tests__/env.test.ts --runInBand
```

Expected: FAIL because `src/config/env.ts` does not exist.

- [ ] **Step 3: Install Supabase client**

Run:

```bash
npm install @supabase/supabase-js react-native-url-polyfill
```

Expected: npm exits with code 0 and updates `package.json` plus `package-lock.json`.

- [ ] **Step 4: Add environment config**

Create `src/config/env.ts`:

```ts
type EnvRecord = Record<string, string | undefined>;

export function getRequiredEnv(env: EnvRecord, key: string): string {
  const value = env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const publicEnv = {
  supabaseUrl: getRequiredEnv(process.env, "EXPO_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: getRequiredEnv(process.env, "EXPO_PUBLIC_SUPABASE_ANON_KEY")
};
```

Create `.env.example`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

- [ ] **Step 5: Add Supabase client**

Create `src/lib/supabase.ts`:

```ts
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "../config/env";

export const supabase = createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
```

- [ ] **Step 6: Add initial SQL schema**

Create `supabase/migrations/202607230001_initial_schema.sql`:

```sql
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

create policy "profiles are readable" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "active listings are readable" on public.listings for select using (status = 'active' or seller_id = auth.uid());
create policy "users create own listings" on public.listings for insert with check (seller_id = auth.uid());
create policy "users update own listings" on public.listings for update using (seller_id = auth.uid());
create policy "approved hubs are readable" on public.hubs for select using (onboarding_status = 'approved' or owner_id = auth.uid());
create policy "users create own hub applications" on public.hubs for insert with check (owner_id = auth.uid());
create policy "conversation participants read" on public.conversations for select using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy "conversation buyers create" on public.conversations for insert with check (buyer_id = auth.uid());
create policy "message participants read" on public.messages for select using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  )
);
create policy "message participants create" on public.messages for insert with check (sender_id = auth.uid());
create policy "users create reports" on public.reports for insert with check (reporter_id = auth.uid());
create policy "users read own reports" on public.reports for select using (reporter_id = auth.uid());
create policy "users manage own blocks" on public.user_blocks for all using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

create index listings_status_created_idx on public.listings (status, created_at desc);
create index listings_seller_idx on public.listings (seller_id);
create index hubs_status_idx on public.hubs (onboarding_status);
create index conversations_participants_idx on public.conversations (buyer_id, seller_id);
create index messages_conversation_created_idx on public.messages (conversation_id, created_at);
create index reports_status_created_idx on public.reports (status, created_at desc);
```

- [ ] **Step 7: Add development seed**

Create `supabase/seed.sql` with one approved cafe, one approved cycling stop, one approved farm stay, three prohibited rules, and three sample active listings after test users are created locally. Use the current `src/data/seed.ts` titles and Shanghai-area hub names so the product still feels familiar during migration.

- [ ] **Step 8: Verify**

Run:

```bash
npm test -- __tests__/env.test.ts --runInBand
npx expo install --check
npm run typecheck
```

Expected: all commands exit with code 0.

- [ ] **Step 9: Commit**

```bash
git add .env.example package.json package-lock.json src/config/env.ts src/lib/supabase.ts supabase __tests__/env.test.ts
git commit -m "feat: add Supabase foundation"
```

---

### Task 2: Authentication and Legal Consent

**Files:**
- Create: `src/services/auth.ts`
- Create: `src/services/policyConsent.ts`
- Create: `src/screens/AuthScreen.tsx`
- Create: `src/screens/LegalConsentScreen.tsx`
- Modify: `App.tsx`
- Modify: `src/domain/types.ts`
- Test: `__tests__/policyConsent.test.ts`
- Test: `__tests__/appSmoke.test.tsx`

- [ ] **Step 1: Write failing policy consent tests**

Create `__tests__/policyConsent.test.ts`:

```ts
import { canEnterApp, createConsentPatch } from "../src/services/policyConsent";

describe("policy consent", () => {
  it("blocks app entry until both terms and privacy are accepted", () => {
    expect(canEnterApp({ acceptedTermsAt: null, acceptedPrivacyAt: "2026-07-23T00:00:00.000Z" })).toBe(false);
    expect(canEnterApp({ acceptedTermsAt: "2026-07-23T00:00:00.000Z", acceptedPrivacyAt: null })).toBe(false);
  });

  it("allows app entry after both policies are accepted", () => {
    expect(
      canEnterApp({
        acceptedTermsAt: "2026-07-23T00:00:00.000Z",
        acceptedPrivacyAt: "2026-07-23T00:00:00.000Z"
      })
    ).toBe(true);
  });

  it("creates matching timestamps for terms and privacy acceptance", () => {
    expect(createConsentPatch("2026-07-23T08:00:00.000Z")).toEqual({
      acceptedTermsAt: "2026-07-23T08:00:00.000Z",
      acceptedPrivacyAt: "2026-07-23T08:00:00.000Z"
    });
  });
});
```

- [ ] **Step 2: Run the failing tests**

Run:

```bash
npm test -- __tests__/policyConsent.test.ts --runInBand
```

Expected: FAIL because `src/services/policyConsent.ts` does not exist.

- [ ] **Step 3: Implement consent service**

Create `src/services/policyConsent.ts`:

```ts
interface ConsentRecord {
  acceptedTermsAt: string | null;
  acceptedPrivacyAt: string | null;
}

export function canEnterApp(consent: ConsentRecord): boolean {
  return Boolean(consent.acceptedTermsAt && consent.acceptedPrivacyAt);
}

export function createConsentPatch(isoTimestamp: string): { acceptedTermsAt: string; acceptedPrivacyAt: string } {
  return {
    acceptedTermsAt: isoTimestamp,
    acceptedPrivacyAt: isoTimestamp
  };
}
```

- [ ] **Step 4: Implement auth service**

Create `src/services/auth.ts` with functions:

```ts
import { supabase } from "../lib/supabase";

export async function signInWithOtp(phone: string) {
  return supabase.auth.signInWithOtp({ phone });
}

export async function verifyOtp(phone: string, token: string) {
  return supabase.auth.verifyOtp({ phone, token, type: "sms" });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentSession() {
  return supabase.auth.getSession();
}
```

- [ ] **Step 5: Add mobile auth screens**

Create `src/screens/AuthScreen.tsx` with phone and OTP inputs, `发送验证码`, `登录`, loading state, and readable errors. Create `src/screens/LegalConsentScreen.tsx` with checkboxes for user agreement and privacy policy plus `同意并继续`. Modify `App.tsx` so unauthenticated users see `AuthScreen`, authenticated users without consent see `LegalConsentScreen`, and consented users see the existing app shell.

- [ ] **Step 6: Verify**

Run:

```bash
npm test -- --runInBand
npm run typecheck
```

Expected: all tests pass and TypeScript exits with code 0.

- [x] **Step 7: Commit**

```bash
git add App.tsx src/services/auth.ts src/services/policyConsent.ts src/screens/AuthScreen.tsx src/screens/LegalConsentScreen.tsx src/domain/types.ts __tests__
git commit -m "feat: add auth and consent gate"
```

---

### Task 3: Listing Publish With Multi-Image Upload

**Files:**
- Create: `src/services/imageAssets.ts`
- Create: `src/services/listingRepository.ts`
- Modify: `src/services/publishValidation.ts`
- Modify: `src/screens/PublishScreen.tsx`
- Modify: `app.json`
- Test: `__tests__/publishValidation.test.ts`
- Test: `__tests__/imageAssets.test.ts`

- [x] **Step 1: Write failing image validation tests**

Create `__tests__/imageAssets.test.ts`:

```ts
import { validateListingImages } from "../src/services/imageAssets";

describe("listing image assets", () => {
  it("requires at least one listing image", () => {
    expect(validateListingImages([])).toEqual(["至少上传 1 张商品照片"]);
  });

  it("limits listing images to nine photos", () => {
    expect(validateListingImages(Array.from({ length: 10 }, (_, index) => `file://${index}.jpg`))).toEqual([
      "最多上传 9 张商品照片"
    ]);
  });

  it("accepts one to nine listing photos", () => {
    expect(validateListingImages(["file://bike.jpg"])).toEqual([]);
  });
});
```

- [x] **Step 2: Run the failing tests**

Run:

```bash
npm test -- __tests__/imageAssets.test.ts --runInBand
```

Expected: FAIL because `src/services/imageAssets.ts` does not exist.

- [x] **Step 3: Install image picker**

Run:

```bash
npx expo install expo-image-picker
```

Expected: package installation exits with code 0.

- [x] **Step 4: Add image validation and upload service**

Create `src/services/imageAssets.ts`:

```ts
import { decode } from "base64-arraybuffer";
import { supabase } from "../lib/supabase";

export function validateListingImages(imageUris: string[]): string[] {
  if (imageUris.length === 0) {
    return ["至少上传 1 张商品照片"];
  }

  if (imageUris.length > 9) {
    return ["最多上传 9 张商品照片"];
  }

  return [];
}

export async function uploadListingImage(userId: string, localUri: string, base64: string): Promise<string> {
  const extension = localUri.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const { error } = await supabase.storage.from("listing-images").upload(path, decode(base64), {
    contentType: extension === "png" ? "image/png" : "image/jpeg",
    upsert: false
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
  return data.publicUrl;
}
```

- [x] **Step 5: Add storage migration**

Create `supabase/migrations/202607230002_storage.sql`:

```sql
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true),
       ('hub-images', 'hub-images', true),
       ('message-images', 'message-images', true)
on conflict (id) do nothing;

create policy "authenticated users upload listing images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'listing-images');

create policy "public listing images are readable"
on storage.objects for select
to public
using (bucket_id = 'listing-images');
```

- [x] **Step 6: Implement listing repository**

Create `src/services/listingRepository.ts` with `createListingDraft`, `submitListingForReview`, `fetchActiveListings`, and `fetchListingById` using Supabase. New listings must start as `pending_review`, not `active`.

- [x] **Step 7: Update Publish screen**

Modify `src/screens/PublishScreen.tsx` so it lets the user pick 1-9 images, previews selected images, uploads images to `listing-images`, creates a listing, creates `listing_verifications`, and displays `已提交审核` after success.

- [x] **Step 8: Verify**

Run:

```bash
npm test -- --runInBand
npm run typecheck
npx expo install --check
```

Expected: all commands exit with code 0.

- [x] **Step 9: Commit**

```bash
git add app.json package.json package-lock.json src/services src/screens/PublishScreen.tsx supabase/migrations __tests__
git commit -m "feat: add listing image publishing"
```

---

### Task 4: Prohibited Rules, Listing Review, and Auto-Block Validation

**Files:**
- Create: `src/services/prohibitedRules.ts`
- Create: `src/services/moderation.ts`
- Modify: `src/services/publishValidation.ts`
- Modify: `src/screens/PublishScreen.tsx`
- Test: `__tests__/prohibitedRules.test.ts`
- Test: `__tests__/publishValidation.test.ts`

- [x] **Step 1: Write failing prohibited rule tests**

Create `__tests__/prohibitedRules.test.ts`:

```ts
import { findProhibitedMatches } from "../src/services/prohibitedRules";

describe("prohibited marketplace rules", () => {
  const rules = [
    { keyword: "假货", severity: "block" as const, explanation: "禁止发布假货或仿品" },
    { keyword: "来路不明", severity: "review" as const, explanation: "需人工复核来源" }
  ];

  it("blocks listings with forbidden keywords", () => {
    expect(findProhibitedMatches("假货车架", rules)).toEqual([rules[0]]);
  });

  it("marks risky wording for review", () => {
    expect(findProhibitedMatches("来路不明的轮组", rules)).toEqual([rules[1]]);
  });
});
```

- [x] **Step 2: Run the failing tests**

Run:

```bash
npm test -- __tests__/prohibitedRules.test.ts --runInBand
```

Expected: FAIL because `src/services/prohibitedRules.ts` does not exist.

- [x] **Step 3: Implement prohibited rule matching**

Create `src/services/prohibitedRules.ts`:

```ts
export interface ProhibitedRule {
  keyword: string;
  severity: "block" | "review";
  explanation: string;
}

export function findProhibitedMatches(text: string, rules: ProhibitedRule[]): ProhibitedRule[] {
  const normalizedText = text.toLowerCase();
  return rules.filter((rule) => normalizedText.includes(rule.keyword.toLowerCase()));
}
```

- [x] **Step 4: Add moderation service**

Create `src/services/moderation.ts` with `submitListingReviewDecision(listingId, decision)`, where `decision` is `approve`, `reject`, or `remove`. It must update `listings.status`, write an `audit_logs` row, and store a readable reason for reject/remove.

- [x] **Step 5: Update publish validation**

Modify `src/services/publishValidation.ts` so blocked prohibited keywords prevent submit, review keywords allow submit but show `将进入人工审核`. Keep price, title, condition, description, and inspection-hub validation from the MVP.

- [x] **Step 6: Verify**

Run:

```bash
npm test -- --runInBand
npm run typecheck
```

Expected: all tests pass and TypeScript exits with code 0.

- [ ] **Step 7: Commit**

```bash
git add src/services src/screens/PublishScreen.tsx __tests__
git commit -m "feat: add prohibited item review rules"
```

---

### Task 5: Reports, Blocks, and Listing Removal

**Files:**
- Create: `src/services/reporting.ts`
- Create: `src/services/blocks.ts`
- Create: `src/screens/ReportScreen.tsx`
- Modify: `src/screens/ListingDetailScreen.tsx`
- Modify: `src/screens/MessagesScreen.tsx`
- Test: `__tests__/reporting.test.ts`
- Test: `__tests__/blocks.test.ts`

- [x] **Step 1: Write failing reporting tests**

Create `__tests__/reporting.test.ts`:

```ts
import { validateReportInput } from "../src/services/reporting";

describe("reporting", () => {
  it("requires a report reason", () => {
    expect(validateReportInput({ reason: "", details: "" })).toEqual(["请选择举报原因"]);
  });

  it("limits report details length", () => {
    expect(validateReportInput({ reason: "疑似假货", details: "a".repeat(501) })).toEqual(["补充说明不能超过 500 字"]);
  });

  it("accepts a valid report", () => {
    expect(validateReportInput({ reason: "疑似假货", details: "价格和来源描述异常" })).toEqual([]);
  });
});
```

- [x] **Step 2: Write failing block tests**

Create `__tests__/blocks.test.ts`:

```ts
import { canStartConversation } from "../src/services/blocks";

describe("user blocks", () => {
  it("prevents conversations when either user blocked the other", () => {
    expect(canStartConversation("buyer-1", "seller-1", [{ blockerId: "buyer-1", blockedId: "seller-1" }])).toBe(false);
    expect(canStartConversation("buyer-1", "seller-1", [{ blockerId: "seller-1", blockedId: "buyer-1" }])).toBe(false);
  });

  it("allows conversations when there is no block relationship", () => {
    expect(canStartConversation("buyer-1", "seller-1", [])).toBe(true);
  });
});
```

- [x] **Step 3: Run failing tests**

Run:

```bash
npm test -- __tests__/reporting.test.ts __tests__/blocks.test.ts --runInBand
```

Expected: FAIL because the services do not exist.

- [x] **Step 4: Implement services**

Create `src/services/reporting.ts`:

```ts
export function validateReportInput(input: { reason: string; details: string }): string[] {
  const errors: string[] = [];
  if (!input.reason.trim()) {
    errors.push("请选择举报原因");
  }
  if (input.details.length > 500) {
    errors.push("补充说明不能超过 500 字");
  }
  return errors;
}
```

Create `src/services/blocks.ts`:

```ts
export interface BlockRelationship {
  blockerId: string;
  blockedId: string;
}

export function canStartConversation(buyerId: string, sellerId: string, blocks: BlockRelationship[]): boolean {
  return !blocks.some(
    (block) =>
      (block.blockerId === buyerId && block.blockedId === sellerId) ||
      (block.blockerId === sellerId && block.blockedId === buyerId)
  );
}
```

- [x] **Step 5: Add mobile reporting and blocking UI**

Create `src/screens/ReportScreen.tsx` for selecting a reason and entering details. Add `举报商品` and `拉黑卖家` actions to `ListingDetailScreen.tsx`. Add `拉黑用户` to `MessagesScreen.tsx`. Successful report creates a `reports` row with `status='open'`; successful block creates a `user_blocks` row.

- [x] **Step 6: Verify**

Run:

```bash
npm test -- --runInBand
npm run typecheck
```

Expected: all tests pass and TypeScript exits with code 0.

- [x] **Step 7: Commit**

```bash
git add src/services src/screens __tests__
git commit -m "feat: add reporting and blocking flows"
```

---

### Task 6: Private Messaging

**Files:**
- Create: `src/services/messageRepository.ts`
- Create: `src/screens/ConversationScreen.tsx`
- Modify: `src/screens/MessagesScreen.tsx`
- Modify: `src/screens/ListingDetailScreen.tsx`
- Test: `__tests__/messages.test.ts`

- [x] **Step 1: Write failing message ordering test**

Create `__tests__/messages.test.ts`:

```ts
import { sortMessagesAscending } from "../src/services/messageRepository";

describe("messages", () => {
  it("sorts conversation messages oldest first", () => {
    expect(
      sortMessagesAscending([
        { id: "2", createdAt: "2026-07-23T09:00:00.000Z" },
        { id: "1", createdAt: "2026-07-23T08:00:00.000Z" }
      ]).map((message) => message.id)
    ).toEqual(["1", "2"]);
  });
});
```

- [x] **Step 2: Run the failing test**

Run:

```bash
npm test -- __tests__/messages.test.ts --runInBand
```

Expected: FAIL because `src/services/messageRepository.ts` does not exist.

- [x] **Step 3: Implement message repository**

Create `src/services/messageRepository.ts` with:

```ts
interface MessageLike {
  id: string;
  createdAt: string;
}

export function sortMessagesAscending<T extends MessageLike>(messages: T[]): T[] {
  return [...messages].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}
```

Then add Supabase functions `startConversation`, `fetchConversations`, `fetchMessages`, `sendTextMessage`, and `subscribeToConversationMessages`.

- [x] **Step 4: Add conversation screen**

Create `src/screens/ConversationScreen.tsx` with message list, text input, send button, loading state, empty state, and realtime subscription cleanup. Connect `ListingDetailScreen.tsx` `私聊卖家` to create/open a conversation. Update `MessagesScreen.tsx` to open existing conversations.

- [x] **Step 5: Verify**

Run:

```bash
npm test -- --runInBand
npm run typecheck
```

Expected: all tests pass and TypeScript exits with code 0.

- [x] **Step 6: Commit**

```bash
git add src/services/messageRepository.ts src/screens __tests__/messages.test.ts
git commit -m "feat: add private messaging"
```

---

### Task 7: Hub Onboarding

**Files:**
- Create: `src/services/hubApplications.ts`
- Create: `src/screens/HubApplyScreen.tsx`
- Modify: `src/screens/ProfileScreen.tsx`
- Modify: `src/screens/HomeScreen.tsx`
- Test: `__tests__/hubApplications.test.ts`

- [ ] **Step 1: Write failing hub application validation tests**

Create `__tests__/hubApplications.test.ts`:

```ts
import { validateHubApplication } from "../src/services/hubApplications";

describe("hub onboarding", () => {
  it("requires core hub application fields", () => {
    expect(
      validateHubApplication({
        name: "",
        address: "",
        businessHours: "",
        contactMethod: "",
        facilityTags: []
      })
    ).toEqual(["请填写据点名称", "请填写地址", "请填写营业时间", "请填写联系方式", "至少选择 1 个设施标签"]);
  });

  it("accepts a complete hub application", () => {
    expect(
      validateHubApplication({
        name: "青浦湖畔咖啡",
        address: "上海市青浦区淀山湖大道 168 号",
        businessHours: "09:00-20:00",
        contactMethod: "到店前电话确认",
        facilityTags: ["咖啡", "停车"]
      })
    ).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
npm test -- __tests__/hubApplications.test.ts --runInBand
```

Expected: FAIL because `src/services/hubApplications.ts` does not exist.

- [ ] **Step 3: Implement validation and repository**

Create `src/services/hubApplications.ts` with validation plus `submitHubApplication`. New hubs must be inserted with `onboarding_status='pending'`. Approved hubs appear in the public hub list; pending and rejected hubs appear only to the owner and admins.

- [ ] **Step 4: Add mobile application UI**

Create `src/screens/HubApplyScreen.tsx`. Add `据点入驻` entry in `ProfileScreen.tsx`. Add pending-status copy after submit: `已提交入驻申请，平台将在 3 个工作日内审核`.

- [ ] **Step 5: Verify**

Run:

```bash
npm test -- --runInBand
npm run typecheck
```

Expected: all tests pass and TypeScript exits with code 0.

- [ ] **Step 6: Commit**

```bash
git add src/services/hubApplications.ts src/screens __tests__/hubApplications.test.ts
git commit -m "feat: add hub onboarding"
```

---

### Task 8: Admin Console

**Files:**
- Create: `apps/admin/package.json`
- Create: `apps/admin/index.html`
- Create: `apps/admin/src/App.tsx`
- Create: `apps/admin/src/lib/supabase.ts`
- Create: `apps/admin/src/services/adminRepository.ts`
- Create: `apps/admin/src/screens/ListingsReview.tsx`
- Create: `apps/admin/src/screens/ReportsReview.tsx`
- Create: `apps/admin/src/screens/HubsReview.tsx`
- Create: `apps/admin/src/screens/UsersAdmin.tsx`
- Create: `apps/admin/src/screens/AuditLog.tsx`
- Create: `apps/admin/src/styles.css`
- Modify: `package.json`
- Test: `apps/admin/src/services/adminRepository.test.ts`

- [ ] **Step 1: Scaffold admin app**

Run:

```bash
npm create vite@latest apps/admin -- --template react-ts
```

Expected: Vite creates a React TypeScript app under `apps/admin`.

- [ ] **Step 2: Add root scripts**

Modify root `package.json` scripts:

```json
{
  "admin:dev": "npm --prefix apps/admin run dev",
  "admin:build": "npm --prefix apps/admin run build",
  "admin:test": "npm --prefix apps/admin run test"
}
```

- [ ] **Step 3: Write failing admin repository test**

Create `apps/admin/src/services/adminRepository.test.ts`:

```ts
import { nextReviewStatus } from "./adminRepository";

describe("admin repository helpers", () => {
  it("maps approve actions to active status", () => {
    expect(nextReviewStatus("approve")).toBe("active");
  });

  it("maps reject actions to removed status", () => {
    expect(nextReviewStatus("reject")).toBe("removed");
  });
});
```

- [ ] **Step 4: Run failing admin test**

Run:

```bash
npm --prefix apps/admin run test -- adminRepository.test.ts
```

Expected: FAIL because `adminRepository.ts` does not exist or test script is not configured.

- [ ] **Step 5: Implement admin repository and screens**

Create `apps/admin/src/services/adminRepository.ts` with `nextReviewStatus`, `fetchPendingListings`, `approveListing`, `rejectListing`, `fetchOpenReports`, `resolveReport`, `fetchPendingHubs`, `approveHub`, `rejectHub`, `limitUser`, and `fetchAuditLogs`.

Implement screens:

- `ListingsReview.tsx`: pending listings, image thumbnails, approve/reject buttons, reason input.
- `ReportsReview.tsx`: open reports, target preview, resolve/reject buttons, resolution note.
- `HubsReview.tsx`: pending hubs, approve/reject buttons, reason input.
- `UsersAdmin.tsx`: user search, status badge, limit/restore controls.
- `AuditLog.tsx`: chronological admin actions.

- [ ] **Step 6: Verify**

Run:

```bash
npm --prefix apps/admin run test -- --runInBand
npm run admin:build
npm test -- --runInBand
npm run typecheck
```

Expected: all commands exit with code 0.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json apps/admin
git commit -m "feat: add admin moderation console"
```

---

### Task 9: Legal, Privacy, and Store Metadata

**Files:**
- Create: `docs/legal/privacy-policy.zh-CN.md`
- Create: `docs/legal/terms-of-service.zh-CN.md`
- Create: `docs/legal/prohibited-items.zh-CN.md`
- Create: `docs/release/app-store-checklist.md`
- Modify: `app.json`
- Modify: `README.md`

- [ ] **Step 1: Draft privacy policy**

Create `docs/legal/privacy-policy.zh-CN.md` with sections: information collected, account and phone number use, listing images, chat content, reports and moderation records, location and hub data, third-party services, retention, deletion request, contact method, and effective date.

- [ ] **Step 2: Draft user agreement**

Create `docs/legal/terms-of-service.zh-CN.md` with sections: user eligibility, marketplace information matching, no platform escrow in beta, offline inspection risk, seller truthfulness obligations, buyer due diligence, prohibited content, reports, account limits, liability boundaries, and contact method.

- [ ] **Step 3: Draft prohibited item rules**

Create `docs/legal/prohibited-items.zh-CN.md` with explicit prohibited categories: stolen goods, counterfeit goods, unclear-source frames/components, recalled unsafe equipment, fake receipts, manipulated serial/frame numbers, illegal goods, harassment content, off-platform scam instructions, and non-cycling spam.

- [ ] **Step 4: Add release checklist**

Create `docs/release/app-store-checklist.md` covering Apple Developer account, App Store Connect app record, privacy nutrition labels, TestFlight build, review test account, Google Play developer account, closed testing, data safety form, support URL, privacy URL, screenshots, icon, package identifiers, and China mainland APP备案 review.

- [ ] **Step 5: Update app metadata**

Modify `app.json`:

```json
{
  "expo": {
    "scheme": "velohive",
    "ios": {
      "bundleIdentifier": "com.velohive.app",
      "supportsTablet": true,
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "用于选择商品、据点和聊天图片。",
        "NSCameraUsageDescription": "用于拍摄商品、据点和聊天图片。"
      }
    },
    "android": {
      "package": "com.velohive.app",
      "permissions": ["CAMERA", "READ_MEDIA_IMAGES"]
    }
  }
}
```

- [ ] **Step 6: Verify**

Run:

```bash
npx expo config --type public
npm run typecheck
```

Expected: Expo config prints `com.velohive.app` for iOS and Android; TypeScript exits with code 0.

- [ ] **Step 7: Commit**

```bash
git add app.json README.md docs/legal docs/release
git commit -m "docs: add store readiness policies"
```

---

### Task 10: Beta Build and Submission Readiness

**Files:**
- Create: `eas.json`
- Modify: `README.md`
- Test: no source test; verification is EAS config plus local checks.

- [ ] **Step 1: Install and configure EAS**

Run:

```bash
npm install --save-dev eas-cli
npx eas build:configure
```

Expected: `eas.json` exists.

- [ ] **Step 2: Use beta build profiles**

Create or update `eas.json`:

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

- [ ] **Step 3: Verify local readiness**

Run:

```bash
npm test -- --runInBand
npm run typecheck
npx expo install --check
npx eas build:inspect --platform ios --profile preview
npx eas build:inspect --platform android --profile preview
```

Expected: tests pass, TypeScript exits with code 0, Expo dependencies are up to date, and EAS inspect produces valid build configuration for iOS and Android.

- [ ] **Step 4: Create internal builds**

Run after Apple and Google credentials are available:

```bash
npx eas build -p ios --profile preview
npx eas build -p android --profile preview
```

Expected: EAS returns installable preview builds.

- [ ] **Step 5: Commit**

```bash
git add eas.json README.md package.json package-lock.json
git commit -m "chore: configure beta builds"
```

---

## Execution Order

1. Supabase Foundation
2. Authentication and Legal Consent
3. Listing Publish With Multi-Image Upload
4. Prohibited Rules, Listing Review, and Auto-Block Validation
5. Reports, Blocks, and Listing Removal
6. Private Messaging
7. Hub Onboarding
8. Admin Console
9. Legal, Privacy, and Store Metadata
10. Beta Build and Submission Readiness

## Acceptance Criteria

- A new user can authenticate, accept terms and privacy policy, and enter the app.
- A seller can publish a listing with 1-9 images and submit it for review.
- A listing with blocked prohibited wording cannot be submitted.
- An admin can approve or reject listings and hubs from the web console.
- A buyer can open a listing, start a conversation, and send messages.
- A user can report listings/users/messages/hubs and block another user.
- Removed listings no longer appear in public browsing.
- Hub owners can submit onboarding applications; approved hubs appear publicly.
- TestFlight and Android internal/closed testing builds can be produced through EAS.
- Legal drafts and store checklist exist for founder/legal review before formal submission.

## Verification Checklist

Run before every merge to `main`:

```bash
npm test -- --runInBand
npm run typecheck
npx expo install --check
```

Run when admin console exists:

```bash
npm run admin:build
npm run admin:test
```

Run before beta distribution:

```bash
npx eas build:inspect --platform ios --profile preview
npx eas build:inspect --platform android --profile preview
```

## Self-Review

- Spec coverage: 登录注册、商品图片发布、私聊、举报、拉黑、下架、禁售规则、协议隐私、据点入驻、后台管理端、上架测试准备均有对应任务。
- Scope boundary: No platform payment, escrow, refund arbitration, route navigation, club management, or paid verification is included in this beta plan.
- Type consistency: Plan uses `profiles`, `listings`, `listing_verifications`, `hubs`, `conversations`, `messages`, `reports`, `user_blocks`, `prohibited_rules`, and `audit_logs` consistently across tasks.
- Placeholder scan: The plan intentionally leaves only real account credentials and legal review as external inputs; no implementation task depends on undefined feature behavior.

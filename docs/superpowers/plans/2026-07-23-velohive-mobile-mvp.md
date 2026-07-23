# VeloHive Mobile MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable Expo React Native mobile MVP prototype for VeloHive with marketplace browsing, hub discovery, listing details, publish validation, messages, and profile screens backed by local seed data.

**Architecture:** The first implementation is a client-only mobile prototype. Domain types, seed data, catalog services, and form validation live in separate focused modules so a real API can replace local data without rewriting screens. Navigation is implemented with lightweight local React state for the first prototype, keeping the app easy to run and test before backend work begins.

**Tech Stack:** Expo, React Native, TypeScript, Jest, React Native Testing Library.

---

## Scope Check

The product spec covers mobile app, backend APIs, admin web console, chat infrastructure, hub onboarding, and later payment/verification features. This plan intentionally covers only the first independently testable subsystem: the mobile MVP prototype with local data. Separate plans should cover backend/API, admin console, real-time chat, and production authentication.

## File Structure

- `package.json`: npm scripts and dependencies for Expo, TypeScript, Jest, and React Native Testing Library.
- `app.json`: Expo app metadata for VeloHive.
- `tsconfig.json`: TypeScript configuration.
- `babel.config.js`: Expo Babel preset.
- `jest.config.js`: Jest preset and setup file.
- `jest.setup.ts`: React Native test setup.
- `App.tsx`: App shell with bottom navigation and screen routing.
- `src/domain/types.ts`: Domain model types matching the product spec.
- `src/data/seed.ts`: Shanghai-area sample users, listings, hubs, conversations, and favorites.
- `src/services/catalog.ts`: Pure functions for filters, lookup, trust score labels, and profile stats.
- `src/services/publishValidation.ts`: Pure validation for listing publish input.
- `src/ui/theme.ts`: Shared colors, spacing, radii, and typography scale.
- `src/ui/components.tsx`: Shared mobile UI components.
- `src/screens/HomeScreen.tsx`: Gear and Hub tabs.
- `src/screens/ListingDetailScreen.tsx`: Listing detail and trust information.
- `src/screens/HubDetailScreen.tsx`: Hub detail and linked listings.
- `src/screens/PublishScreen.tsx`: Publish form prototype with validation.
- `src/screens/MessagesScreen.tsx`: Conversation list.
- `src/screens/ProfileScreen.tsx`: Profile and user stats.
- `__tests__/catalog.test.ts`: Unit tests for catalog functions.
- `__tests__/publishValidation.test.ts`: Unit tests for publish validation.
- `__tests__/appSmoke.test.tsx`: Smoke test for the app shell.

---

### Task 1: Create Expo TypeScript Project Skeleton

**Files:**
- Create: `package.json`
- Create: `app.json`
- Create: `tsconfig.json`
- Create: `babel.config.js`
- Create: `jest.config.js`
- Create: `jest.setup.ts`

- [ ] **Step 1: Write project config files**

Create `package.json`:

```json
{
  "name": "velohive",
  "version": "0.1.0",
  "private": true,
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "ios": "expo start --ios",
    "android": "expo start --android",
    "web": "expo start --web",
    "typecheck": "tsc --noEmit",
    "test": "jest"
  },
  "dependencies": {
    "@expo/vector-icons": "^14.0.4",
    "expo": "^51.0.39",
    "expo-status-bar": "^1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.5",
    "react-native-safe-area-context": "4.10.5"
  },
  "devDependencies": {
    "@testing-library/jest-native": "^5.4.3",
    "@testing-library/react-native": "^12.5.3",
    "@types/jest": "^29.5.12",
    "@types/react": "~18.2.79",
    "jest": "^29.7.0",
    "jest-expo": "^51.0.4",
    "react-test-renderer": "18.2.0",
    "typescript": "~5.3.3"
  }
}
```

Create `app.json`:

```json
{
  "expo": {
    "name": "VeloHive",
    "slug": "velohive",
    "version": "0.1.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#F7C948"
      }
    },
    "web": {
      "bundler": "metro"
    }
  }
}
```

Create `tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["App.tsx", "src", "__tests__", "jest.setup.ts"]
}
```

Create `babel.config.js`:

```js
module.exports = function babelConfig(api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"]
  };
};
```

Create `jest.config.js`:

```js
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*))"
  ]
};
```

Create `jest.setup.ts`:

```ts
import "@testing-library/jest-native/extend-expect";
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and npm exits with code 0.

- [ ] **Step 3: Verify the skeleton scripts exist**

Run:

```bash
npm run typecheck
```

Expected: FAIL because `App.tsx` does not exist yet. The failure should mention that an input file is missing or no inputs were found.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json app.json tsconfig.json babel.config.js jest.config.js jest.setup.ts
git commit -m "chore: scaffold Expo TypeScript project"
```

---

### Task 2: Add Domain Types and Seed Data

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/data/seed.ts`
- Create: `__tests__/catalog.test.ts`

- [ ] **Step 1: Create domain types**

Create `src/domain/types.ts`:

```ts
export type ListingCategory =
  | "complete_bike"
  | "frameset"
  | "wheelset"
  | "groupset"
  | "power_meter"
  | "computer"
  | "shoes"
  | "apparel"
  | "accessory";

export type ListingStatus = "active" | "chatting" | "viewing_scheduled" | "sold" | "unavailable";

export type HubType = "cafe" | "farm_stay" | "bike_shop" | "cycling_stop" | "other";

export type HubOnboardingStatus = "approved" | "pending" | "rejected";

export type FavoriteTargetType = "listing" | "hub";

export interface User {
  id: string;
  nickname: string;
  avatarUrl: string;
  city: string;
  riderTags: string[];
  listingCount: number;
  soldCount: number;
  status: "active" | "limited";
}

export interface ListingVerification {
  listingId: string;
  purchaseProofUrls: string[];
  maskedSerialOrFrameNumber?: string;
  selfVerificationScore: number;
  notes: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  category: ListingCategory;
  brand: string;
  model: string;
  price: number;
  condition: string;
  specs: string[];
  description: string;
  flawDescription: string;
  imageUrls: string[];
  status: ListingStatus;
  supportsOfflineInspection: boolean;
  recommendedHubIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Hub {
  id: string;
  name: string;
  type: HubType;
  address: string;
  latitude: number;
  longitude: number;
  businessHours: string;
  facilityTags: string[];
  imageUrls: string[];
  contactMethod: string;
  suitableForInspection: boolean;
  onboardingStatus: HubOnboardingStatus;
}

export interface Conversation {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  lastMessageAt: string;
  meetupStatus: ListingStatus;
  lastMessagePreview: string;
}

export interface Favorite {
  id: string;
  userId: string;
  targetType: FavoriteTargetType;
  targetId: string;
}
```

- [ ] **Step 2: Create seed data**

Create `src/data/seed.ts`:

```ts
import type { Conversation, Favorite, Hub, Listing, ListingVerification, User } from "../domain/types";

export const currentUserId = "user-001";

export const users: User[] = [
  {
    id: "user-001",
    nickname: "阿泽",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    city: "上海",
    riderTags: ["周末骑", "青浦线", "器材党"],
    listingCount: 2,
    soldCount: 3,
    status: "active"
  },
  {
    id: "user-002",
    nickname: "浦西爬坡手",
    avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
    city: "上海",
    riderTags: ["整车升级", "咖啡骑"],
    listingCount: 4,
    soldCount: 8,
    status: "active"
  }
];

export const hubs: Hub[] = [
  {
    id: "hub-001",
    name: "青浦湖畔咖啡",
    type: "cafe",
    address: "上海市青浦区淀山湖大道 168 号",
    latitude: 31.1042,
    longitude: 121.0154,
    businessHours: "09:00-20:00",
    facilityTags: ["咖啡", "补水", "停车", "厕所", "适合验货"],
    imageUrls: ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb"],
    contactMethod: "到店前电话确认",
    suitableForInspection: true,
    onboardingStatus: "approved"
  },
  {
    id: "hub-002",
    name: "松江骑行驿站",
    type: "cycling_stop",
    address: "上海市松江区辰塔路 88 号",
    latitude: 31.0338,
    longitude: 121.2277,
    businessHours: "08:30-19:30",
    facilityTags: ["打气", "补水", "充电", "停车", "适合验货"],
    imageUrls: ["https://images.unsplash.com/photo-1525102195674-3ad0b706c7a6"],
    contactMethod: "公众号预约",
    suitableForInspection: true,
    onboardingStatus: "approved"
  },
  {
    id: "hub-003",
    name: "昆山周末农庄",
    type: "farm_stay",
    address: "昆山市锦溪镇环湖路 28 号",
    latitude: 31.1781,
    longitude: 120.9034,
    businessHours: "10:00-21:00",
    facilityTags: ["餐食", "停车", "厕所", "集合"],
    imageUrls: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"],
    contactMethod: "电话预约包间",
    suitableForInspection: false,
    onboardingStatus: "approved"
  }
];

export const listings: Listing[] = [
  {
    id: "listing-001",
    sellerId: "user-002",
    title: "Specialized Tarmac SL7 整车 52 码",
    category: "complete_bike",
    brand: "Specialized",
    model: "Tarmac SL7",
    price: 32800,
    condition: "9 成新",
    specs: ["52 码", "Ultegra Di2", "碳轮", "含码表架"],
    description: "升级新车后出，上海可当面看车。",
    flawDescription: "右侧手变有轻微擦痕，已拍照标注。",
    imageUrls: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e"],
    status: "active",
    supportsOfflineInspection: true,
    recommendedHubIds: ["hub-001", "hub-002"],
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-22T09:00:00.000Z"
  },
  {
    id: "listing-002",
    sellerId: "user-001",
    title: "Shimano Ultegra R8170 套件",
    category: "groupset",
    brand: "Shimano",
    model: "Ultegra R8170",
    price: 6200,
    condition: "8.5 成新",
    specs: ["油压碟刹", "172.5 曲柄", "11-30 飞轮"],
    description: "正常使用拆车件，功能正常。",
    flawDescription: "后拨外侧有正常使用痕迹。",
    imageUrls: ["https://images.unsplash.com/photo-1571068316344-75bc76f77890"],
    status: "active",
    supportsOfflineInspection: true,
    recommendedHubIds: ["hub-002"],
    createdAt: "2026-07-19T12:30:00.000Z",
    updatedAt: "2026-07-21T13:20:00.000Z"
  },
  {
    id: "listing-003",
    sellerId: "user-002",
    title: "Garmin Edge 840 码表",
    category: "computer",
    brand: "Garmin",
    model: "Edge 840",
    price: 2180,
    condition: "95 新",
    specs: ["国行", "盒装", "含硅胶套"],
    description: "使用频率低，屏幕无划痕。",
    flawDescription: "外盒一角压痕。",
    imageUrls: ["https://images.unsplash.com/photo-1558611848-73f7eb4001a1"],
    status: "active",
    supportsOfflineInspection: false,
    recommendedHubIds: [],
    createdAt: "2026-07-18T08:30:00.000Z",
    updatedAt: "2026-07-20T08:30:00.000Z"
  }
];

export const verifications: ListingVerification[] = [
  {
    listingId: "listing-001",
    purchaseProofUrls: ["https://images.unsplash.com/photo-1554224155-6726b3ff858f"],
    maskedSerialOrFrameNumber: "WSBC****0427",
    selfVerificationScore: 92,
    notes: "购买凭证、车架号和瑕疵照片齐全。"
  },
  {
    listingId: "listing-002",
    purchaseProofUrls: [],
    maskedSerialOrFrameNumber: "R8170****21",
    selfVerificationScore: 74,
    notes: "有序列号和拆车说明，缺购买凭证。"
  },
  {
    listingId: "listing-003",
    purchaseProofUrls: [],
    selfVerificationScore: 58,
    notes: "基础照片齐全，未提供购买凭证。"
  }
];

export const conversations: Conversation[] = [
  {
    id: "conversation-001",
    listingId: "listing-001",
    buyerId: "user-001",
    sellerId: "user-002",
    lastMessageAt: "2026-07-22T20:10:00.000Z",
    meetupStatus: "viewing_scheduled",
    lastMessagePreview: "周六下午青浦湖畔咖啡看车可以。"
  }
];

export const favorites: Favorite[] = [
  {
    id: "favorite-001",
    userId: "user-001",
    targetType: "listing",
    targetId: "listing-001"
  },
  {
    id: "favorite-002",
    userId: "user-001",
    targetType: "hub",
    targetId: "hub-001"
  }
];
```

- [ ] **Step 3: Add an initial seed data test**

Create `__tests__/catalog.test.ts`:

```ts
import { hubs, listings, users, verifications } from "../src/data/seed";

describe("seed data", () => {
  it("contains Shanghai-area marketplace content", () => {
    expect(users.length).toBeGreaterThanOrEqual(2);
    expect(listings.length).toBeGreaterThanOrEqual(3);
    expect(hubs.length).toBeGreaterThanOrEqual(3);
  });

  it("links every verification to an existing listing", () => {
    const listingIds = new Set(listings.map((listing) => listing.id));
    expect(verifications.every((verification) => listingIds.has(verification.listingId))).toBe(true);
  });

  it("links inspection-supported listings to approved hubs", () => {
    const approvedHubIds = new Set(hubs.filter((hub) => hub.onboardingStatus === "approved").map((hub) => hub.id));
    const supportedListings = listings.filter((listing) => listing.supportsOfflineInspection);

    expect(supportedListings.length).toBeGreaterThan(0);
    expect(
      supportedListings.every((listing) =>
        listing.recommendedHubIds.length > 0 &&
        listing.recommendedHubIds.every((hubId) => approvedHubIds.has(hubId))
      )
    ).toBe(true);
  });
});
```

- [ ] **Step 4: Run the test**

Run:

```bash
npm test -- --runTestsByPath __tests__/catalog.test.ts
```

Expected: PASS with 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/domain/types.ts src/data/seed.ts __tests__/catalog.test.ts
git commit -m "feat: add VeloHive domain seed data"
```

---

### Task 3: Add Catalog Services

**Files:**
- Create: `src/services/catalog.ts`
- Modify: `__tests__/catalog.test.ts`

- [ ] **Step 1: Extend catalog tests**

Replace `__tests__/catalog.test.ts` with:

```ts
import { hubs, listings, users, verifications } from "../src/data/seed";
import {
  findHubById,
  findListingById,
  getListingSeller,
  getListingVerification,
  getProfileStats,
  getTrustLabel,
  searchListings,
  suitableInspectionHubs
} from "../src/services/catalog";

describe("seed data", () => {
  it("contains Shanghai-area marketplace content", () => {
    expect(users.length).toBeGreaterThanOrEqual(2);
    expect(listings.length).toBeGreaterThanOrEqual(3);
    expect(hubs.length).toBeGreaterThanOrEqual(3);
  });

  it("links every verification to an existing listing", () => {
    const listingIds = new Set(listings.map((listing) => listing.id));
    expect(verifications.every((verification) => listingIds.has(verification.listingId))).toBe(true);
  });

  it("links inspection-supported listings to approved hubs", () => {
    const approvedHubIds = new Set(hubs.filter((hub) => hub.onboardingStatus === "approved").map((hub) => hub.id));
    const supportedListings = listings.filter((listing) => listing.supportsOfflineInspection);

    expect(supportedListings.length).toBeGreaterThan(0);
    expect(
      supportedListings.every((listing) =>
        listing.recommendedHubIds.length > 0 &&
        listing.recommendedHubIds.every((hubId) => approvedHubIds.has(hubId))
      )
    ).toBe(true);
  });
});

describe("catalog services", () => {
  it("searches listings by title, brand, and model", () => {
    expect(searchListings("tarmac").map((listing) => listing.id)).toEqual(["listing-001"]);
    expect(searchListings("Shimano").map((listing) => listing.id)).toEqual(["listing-002"]);
    expect(searchListings("edge").map((listing) => listing.id)).toEqual(["listing-003"]);
  });

  it("filters listings by offline inspection support", () => {
    expect(searchListings("", { supportsOfflineInspection: true }).map((listing) => listing.id)).toEqual([
      "listing-001",
      "listing-002"
    ]);
  });

  it("returns trusted labels from self-verification scores", () => {
    expect(getTrustLabel(92)).toBe("自证完整");
    expect(getTrustLabel(74)).toBe("自证较完整");
    expect(getTrustLabel(58)).toBe("基础自证");
  });

  it("resolves listing relationships", () => {
    expect(findListingById("listing-001")?.title).toContain("Tarmac");
    expect(getListingSeller("listing-001")?.nickname).toBe("浦西爬坡手");
    expect(getListingVerification("listing-001")?.selfVerificationScore).toBe(92);
    expect(findHubById("hub-001")?.name).toBe("青浦湖畔咖啡");
  });

  it("returns hubs that are suitable for inspection", () => {
    expect(suitableInspectionHubs().map((hub) => hub.id)).toEqual(["hub-001", "hub-002"]);
  });

  it("calculates profile stats", () => {
    expect(getProfileStats("user-001")).toEqual({
      activeListings: 1,
      favorites: 2,
      conversations: 1
    });
  });
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
npm test -- --runTestsByPath __tests__/catalog.test.ts
```

Expected: FAIL because `src/services/catalog.ts` does not exist.

- [ ] **Step 3: Implement catalog services**

Create `src/services/catalog.ts`:

```ts
import { conversations, favorites, hubs, listings, users, verifications } from "../data/seed";
import type { Hub, Listing, ListingCategory, ListingVerification, User } from "../domain/types";

interface ListingFilters {
  category?: ListingCategory;
  supportsOfflineInspection?: boolean;
  maxPrice?: number;
}

export function findListingById(id: string): Listing | undefined {
  return listings.find((listing) => listing.id === id);
}

export function findHubById(id: string): Hub | undefined {
  return hubs.find((hub) => hub.id === id);
}

export function findUserById(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

export function getListingSeller(listingId: string): User | undefined {
  const listing = findListingById(listingId);
  return listing ? findUserById(listing.sellerId) : undefined;
}

export function getListingVerification(listingId: string): ListingVerification | undefined {
  return verifications.find((verification) => verification.listingId === listingId);
}

export function searchListings(query: string, filters: ListingFilters = {}): Listing[] {
  const normalizedQuery = query.trim().toLowerCase();

  return listings.filter((listing) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [listing.title, listing.brand, listing.model, listing.description].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      );
    const matchesCategory = filters.category === undefined || listing.category === filters.category;
    const matchesInspection =
      filters.supportsOfflineInspection === undefined ||
      listing.supportsOfflineInspection === filters.supportsOfflineInspection;
    const matchesPrice = filters.maxPrice === undefined || listing.price <= filters.maxPrice;

    return matchesQuery && matchesCategory && matchesInspection && matchesPrice && listing.status === "active";
  });
}

export function suitableInspectionHubs(): Hub[] {
  return hubs.filter((hub) => hub.onboardingStatus === "approved" && hub.suitableForInspection);
}

export function getTrustLabel(score: number): "自证完整" | "自证较完整" | "基础自证" {
  if (score >= 85) {
    return "自证完整";
  }
  if (score >= 70) {
    return "自证较完整";
  }
  return "基础自证";
}

export function getProfileStats(userId: string): { activeListings: number; favorites: number; conversations: number } {
  return {
    activeListings: listings.filter((listing) => listing.sellerId === userId && listing.status === "active").length,
    favorites: favorites.filter((favorite) => favorite.userId === userId).length,
    conversations: conversations.filter(
      (conversation) => conversation.buyerId === userId || conversation.sellerId === userId
    ).length
  };
}
```

- [ ] **Step 4: Run tests and typecheck**

Run:

```bash
npm test -- --runTestsByPath __tests__/catalog.test.ts
npm run typecheck
```

Expected: catalog tests PASS. Typecheck may still fail until `App.tsx` is added in Task 5.

- [ ] **Step 5: Commit**

```bash
git add src/services/catalog.ts __tests__/catalog.test.ts
git commit -m "feat: add catalog services"
```

---

### Task 4: Add Publish Validation

**Files:**
- Create: `src/services/publishValidation.ts`
- Create: `__tests__/publishValidation.test.ts`

- [ ] **Step 1: Write validation tests**

Create `__tests__/publishValidation.test.ts`:

```ts
import { validatePublishDraft } from "../src/services/publishValidation";

describe("validatePublishDraft", () => {
  it("accepts a complete listing draft", () => {
    expect(
      validatePublishDraft({
        title: "Cervelo R5 车架组",
        brand: "Cervelo",
        model: "R5",
        price: "16800",
        condition: "9 成新",
        flawDescription: "五通附近有轻微使用痕迹",
        supportsOfflineInspection: true,
        recommendedHubIds: ["hub-001"]
      })
    ).toEqual([]);
  });

  it("requires core marketplace fields", () => {
    expect(
      validatePublishDraft({
        title: "",
        brand: "",
        model: "",
        price: "",
        condition: "",
        flawDescription: "",
        supportsOfflineInspection: false,
        recommendedHubIds: []
      })
    ).toEqual(["请填写标题", "请填写品牌", "请填写型号", "请填写价格", "请填写成色", "请说明瑕疵或写明无明显瑕疵"]);
  });

  it("requires a hub when offline inspection is enabled", () => {
    expect(
      validatePublishDraft({
        title: "轮组",
        brand: "Shimano",
        model: "C50",
        price: "4200",
        condition: "8 成新",
        flawDescription: "正常使用痕迹",
        supportsOfflineInspection: true,
        recommendedHubIds: []
      })
    ).toContain("支持线下验货时至少选择一个推荐据点");
  });

  it("rejects non-positive prices", () => {
    expect(
      validatePublishDraft({
        title: "码表",
        brand: "Garmin",
        model: "Edge 840",
        price: "0",
        condition: "95 新",
        flawDescription: "无明显瑕疵",
        supportsOfflineInspection: false,
        recommendedHubIds: []
      })
    ).toContain("价格必须大于 0");
  });
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
npm test -- --runTestsByPath __tests__/publishValidation.test.ts
```

Expected: FAIL because `src/services/publishValidation.ts` does not exist.

- [ ] **Step 3: Implement validation**

Create `src/services/publishValidation.ts`:

```ts
export interface PublishDraft {
  title: string;
  brand: string;
  model: string;
  price: string;
  condition: string;
  flawDescription: string;
  supportsOfflineInspection: boolean;
  recommendedHubIds: string[];
}

export function validatePublishDraft(draft: PublishDraft): string[] {
  const errors: string[] = [];

  if (draft.title.trim().length === 0) {
    errors.push("请填写标题");
  }
  if (draft.brand.trim().length === 0) {
    errors.push("请填写品牌");
  }
  if (draft.model.trim().length === 0) {
    errors.push("请填写型号");
  }
  if (draft.price.trim().length === 0) {
    errors.push("请填写价格");
  }
  if (draft.condition.trim().length === 0) {
    errors.push("请填写成色");
  }
  if (draft.flawDescription.trim().length === 0) {
    errors.push("请说明瑕疵或写明无明显瑕疵");
  }

  const parsedPrice = Number(draft.price);
  if (draft.price.trim().length > 0 && (!Number.isFinite(parsedPrice) || parsedPrice <= 0)) {
    errors.push("价格必须大于 0");
  }

  if (draft.supportsOfflineInspection && draft.recommendedHubIds.length === 0) {
    errors.push("支持线下验货时至少选择一个推荐据点");
  }

  return errors;
}
```

- [ ] **Step 4: Run validation tests**

Run:

```bash
npm test -- --runTestsByPath __tests__/publishValidation.test.ts
```

Expected: PASS with 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/services/publishValidation.ts __tests__/publishValidation.test.ts
git commit -m "feat: add listing publish validation"
```

---

### Task 5: Build UI Theme, Shared Components, and App Shell

**Files:**
- Create: `src/ui/theme.ts`
- Create: `src/ui/components.tsx`
- Create: `App.tsx`
- Create: `__tests__/appSmoke.test.tsx`

- [ ] **Step 1: Write app smoke test**

Create `__tests__/appSmoke.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react-native";
import App from "../App";

describe("App", () => {
  it("renders the VeloHive shell", () => {
    render(<App />);

    expect(screen.getByText("VeloHive")).toBeTruthy();
    expect(screen.getByText("淘装备")).toBeTruthy();
    expect(screen.getByText("找据点")).toBeTruthy();
    expect(screen.getByText("发布")).toBeTruthy();
    expect(screen.getByText("消息")).toBeTruthy();
    expect(screen.getByText("我的")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run smoke test and confirm failure**

Run:

```bash
npm test -- --runTestsByPath __tests__/appSmoke.test.tsx
```

Expected: FAIL because `App.tsx` does not exist.

- [ ] **Step 3: Add theme**

Create `src/ui/theme.ts`:

```ts
export const colors = {
  background: "#F6F3EC",
  surface: "#FFFFFF",
  ink: "#1E293B",
  muted: "#64748B",
  line: "#E2E8F0",
  honey: "#F7C948",
  forest: "#226F54",
  coral: "#E76F51",
  sky: "#2F80ED"
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24
};

export const radii = {
  sm: 6,
  md: 8
};
```

- [ ] **Step 4: Add shared components**

Create `src/ui/components.tsx`:

```tsx
import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "./theme";

interface ButtonProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function AppText({ children, muted = false }: PropsWithChildren<{ muted?: boolean }>) {
  return <Text style={[styles.text, muted && styles.muted]}>{children}</Text>;
}

export function Section({ children }: PropsWithChildren) {
  return <View style={styles.section}>{children}</View>;
}

export function Chip({ label, selected = false, onPress }: ButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton({ label, onPress }: ButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.primaryButton}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20
  },
  muted: {
    color: colors.muted
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    marginBottom: spacing.md
  },
  chip: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface
  },
  chipSelected: {
    backgroundColor: colors.forest,
    borderColor: colors.forest
  },
  chipText: {
    color: colors.ink,
    fontSize: 13
  },
  chipTextSelected: {
    color: colors.surface
  },
  primaryButton: {
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: "center"
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "700"
  }
});
```

- [ ] **Step 5: Add App shell**

Create `App.tsx`:

```tsx
import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Chip, Section } from "./src/ui/components";
import { colors, spacing } from "./src/ui/theme";

type MainTab = "home" | "map" | "publish" | "messages" | "profile";
type HomeTab = "gear" | "hubs";

const mainTabs: Array<{ id: MainTab; label: string }> = [
  { id: "home", label: "首页" },
  { id: "map", label: "地图" },
  { id: "publish", label: "发布" },
  { id: "messages", label: "消息" },
  { id: "profile", label: "我的" }
];

export default function App() {
  const [mainTab, setMainTab] = useState<MainTab>("home");
  const [homeTab, setHomeTab] = useState<HomeTab>("gear");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.brand}>VeloHive</Text>
        <Text style={styles.region}>上海周边</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {mainTab === "home" ? (
          <>
            <View style={styles.tabRow}>
              <Chip label="淘装备" selected={homeTab === "gear"} onPress={() => setHomeTab("gear")} />
              <Chip label="找据点" selected={homeTab === "hubs"} onPress={() => setHomeTab("hubs")} />
            </View>
            <Section>
              <Text style={styles.title}>{homeTab === "gear" ? "支持线下验货的公路车闲置" : "骑友友好据点"}</Text>
              <Text style={styles.body}>
                {homeTab === "gear"
                  ? "整车、车架、轮组、套件、码表和高价值配件。"
                  : "咖啡吧、农家乐、车店、骑行驿站，适合休息、集合和验货。"}
              </Text>
            </Section>
          </>
        ) : (
          <Section>
            <Text style={styles.title}>{mainTabs.find((tab) => tab.id === mainTab)?.label}</Text>
            <Text style={styles.body}>该页面将在后续任务中接入具体内容。</Text>
          </Section>
        )}
      </ScrollView>
      <View style={styles.bottomTabs}>
        {mainTabs.map((tab) => (
          <Chip key={tab.id} label={tab.label} selected={mainTab === tab.id} onPress={() => setMainTab(tab.id)} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.surface
  },
  brand: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800"
  },
  region: {
    color: colors.muted,
    marginTop: spacing.xs
  },
  content: {
    padding: spacing.lg
  },
  tabRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  bottomTabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs,
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface
  }
});
```

- [ ] **Step 6: Verify app shell**

Run:

```bash
npm test -- --runTestsByPath __tests__/appSmoke.test.tsx
npm run typecheck
```

Expected: app smoke test PASS and typecheck PASS.

- [ ] **Step 7: Commit**

```bash
git add App.tsx src/ui/theme.ts src/ui/components.tsx __tests__/appSmoke.test.tsx
git commit -m "feat: add mobile app shell"
```

---

### Task 6: Implement Gear and Hub Screens

**Files:**
- Create: `src/screens/HomeScreen.tsx`
- Modify: `App.tsx`
- Modify: `__tests__/appSmoke.test.tsx`

- [ ] **Step 1: Expand smoke test expectations**

Replace `__tests__/appSmoke.test.tsx` with:

```tsx
import { fireEvent, render, screen } from "@testing-library/react-native";
import App from "../App";

describe("App", () => {
  it("renders marketplace listings on the Gear tab", () => {
    render(<App />);

    expect(screen.getByText("VeloHive")).toBeTruthy();
    expect(screen.getByText("Specialized Tarmac SL7 整车 52 码")).toBeTruthy();
    expect(screen.getByText("Shimano Ultegra R8170 套件")).toBeTruthy();
  });

  it("switches from Gear to Hubs", () => {
    render(<App />);

    fireEvent.press(screen.getByText("找据点"));

    expect(screen.getByText("青浦湖畔咖啡")).toBeTruthy();
    expect(screen.getByText("松江骑行驿站")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run smoke test and confirm failure**

Run:

```bash
npm test -- --runTestsByPath __tests__/appSmoke.test.tsx
```

Expected: FAIL because the home screen does not render seed listings or hubs yet.

- [ ] **Step 3: Implement HomeScreen**

Create `src/screens/HomeScreen.tsx`:

```tsx
import { Image, StyleSheet, Text, View } from "react-native";
import { hubs, listings } from "../data/seed";
import { getListingVerification, getTrustLabel } from "../services/catalog";
import { Chip, Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

type HomeTab = "gear" | "hubs";

interface HomeScreenProps {
  activeTab: HomeTab;
  onChangeTab: (tab: HomeTab) => void;
}

export function HomeScreen({ activeTab, onChangeTab }: HomeScreenProps) {
  return (
    <>
      <View style={styles.tabRow}>
        <Chip label="淘装备" selected={activeTab === "gear"} onPress={() => onChangeTab("gear")} />
        <Chip label="找据点" selected={activeTab === "hubs"} onPress={() => onChangeTab("hubs")} />
      </View>
      {activeTab === "gear" ? <GearList /> : <HubList />}
    </>
  );
}

function GearList() {
  return (
    <>
      <Text style={styles.screenTitle}>支持线下验货的公路车闲置</Text>
      {listings.map((listing) => {
        const verification = getListingVerification(listing.id);
        const trustLabel = verification ? getTrustLabel(verification.selfVerificationScore) : "基础自证";

        return (
          <Section key={listing.id}>
            <Image source={{ uri: listing.imageUrls[0] }} style={styles.image} />
            <Text style={styles.cardTitle}>{listing.title}</Text>
            <Text style={styles.price}>￥{listing.price.toLocaleString("zh-CN")}</Text>
            <Text style={styles.meta}>
              {listing.brand} {listing.model} · {listing.condition}
            </Text>
            <Text style={styles.meta}>
              {listing.supportsOfflineInspection ? "支持线下验货" : "暂不支持线下验货"} · {trustLabel}
            </Text>
          </Section>
        );
      })}
    </>
  );
}

function HubList() {
  return (
    <>
      <Text style={styles.screenTitle}>骑友友好据点</Text>
      {hubs.map((hub) => (
        <Section key={hub.id}>
          <Image source={{ uri: hub.imageUrls[0] }} style={styles.image} />
          <Text style={styles.cardTitle}>{hub.name}</Text>
          <Text style={styles.meta}>{hub.address}</Text>
          <Text style={styles.meta}>{hub.facilityTags.join(" · ")}</Text>
        </Section>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  screenTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.md
  },
  image: {
    width: "100%",
    height: 140,
    borderRadius: 8,
    backgroundColor: colors.line,
    marginBottom: spacing.md
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  price: {
    color: colors.coral,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.xs
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  }
});
```

- [ ] **Step 4: Update App to use HomeScreen**

Replace `App.tsx` with:

```tsx
import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { HomeScreen } from "./src/screens/HomeScreen";
import { Chip, Section } from "./src/ui/components";
import { colors, spacing } from "./src/ui/theme";

type MainTab = "home" | "map" | "publish" | "messages" | "profile";
type HomeTab = "gear" | "hubs";

const mainTabs: Array<{ id: MainTab; label: string }> = [
  { id: "home", label: "首页" },
  { id: "map", label: "地图" },
  { id: "publish", label: "发布" },
  { id: "messages", label: "消息" },
  { id: "profile", label: "我的" }
];

export default function App() {
  const [mainTab, setMainTab] = useState<MainTab>("home");
  const [homeTab, setHomeTab] = useState<HomeTab>("gear");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.brand}>VeloHive</Text>
        <Text style={styles.region}>上海周边</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {mainTab === "home" ? (
          <HomeScreen activeTab={homeTab} onChangeTab={setHomeTab} />
        ) : (
          <Section>
            <Text style={styles.title}>{mainTabs.find((tab) => tab.id === mainTab)?.label}</Text>
            <Text style={styles.body}>该页面将在后续任务中接入具体内容。</Text>
          </Section>
        )}
      </ScrollView>
      <View style={styles.bottomTabs}>
        {mainTabs.map((tab) => (
          <Chip key={tab.id} label={tab.label} selected={mainTab === tab.id} onPress={() => setMainTab(tab.id)} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.surface
  },
  brand: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800"
  },
  region: {
    color: colors.muted,
    marginTop: spacing.xs
  },
  content: {
    padding: spacing.lg
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  bottomTabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs,
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface
  }
});
```

- [ ] **Step 5: Verify**

Run:

```bash
npm test -- --runTestsByPath __tests__/appSmoke.test.tsx
npm run typecheck
```

Expected: smoke tests PASS and typecheck PASS.

- [ ] **Step 6: Commit**

```bash
git add App.tsx src/screens/HomeScreen.tsx __tests__/appSmoke.test.tsx
git commit -m "feat: render marketplace and hub home tabs"
```

---

### Task 7: Add Publish, Messages, and Profile Screens

**Files:**
- Create: `src/screens/PublishScreen.tsx`
- Create: `src/screens/MessagesScreen.tsx`
- Create: `src/screens/ProfileScreen.tsx`
- Modify: `App.tsx`
- Modify: `__tests__/appSmoke.test.tsx`

- [ ] **Step 1: Extend smoke test**

Replace `__tests__/appSmoke.test.tsx` with:

```tsx
import { fireEvent, render, screen } from "@testing-library/react-native";
import App from "../App";

describe("App", () => {
  it("renders marketplace listings on the Gear tab", () => {
    render(<App />);

    expect(screen.getByText("VeloHive")).toBeTruthy();
    expect(screen.getByText("Specialized Tarmac SL7 整车 52 码")).toBeTruthy();
    expect(screen.getByText("Shimano Ultegra R8170 套件")).toBeTruthy();
  });

  it("switches from Gear to Hubs", () => {
    render(<App />);

    fireEvent.press(screen.getByText("找据点"));

    expect(screen.getByText("青浦湖畔咖啡")).toBeTruthy();
    expect(screen.getByText("松江骑行驿站")).toBeTruthy();
  });

  it("opens Publish, Messages, and Profile tabs", () => {
    render(<App />);

    fireEvent.press(screen.getByText("发布"));
    expect(screen.getByText("发布闲置装备")).toBeTruthy();

    fireEvent.press(screen.getByText("消息"));
    expect(screen.getByText("周六下午青浦湖畔咖啡看车可以。")).toBeTruthy();

    fireEvent.press(screen.getByText("我的"));
    expect(screen.getByText("阿泽")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run smoke test and confirm failure**

Run:

```bash
npm test -- --runTestsByPath __tests__/appSmoke.test.tsx
```

Expected: FAIL because the new screens are not wired yet.

- [ ] **Step 3: Create PublishScreen**

Create `src/screens/PublishScreen.tsx`:

```tsx
import { useMemo, useState } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { hubs } from "../data/seed";
import { validatePublishDraft } from "../services/publishValidation";
import { Chip, PrimaryButton, Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

export function PublishScreen() {
  const [supportsInspection, setSupportsInspection] = useState(true);
  const [selectedHubId, setSelectedHubId] = useState("hub-001");

  const draft = useMemo(
    () => ({
      title: "请输入标题",
      brand: "品牌",
      model: "型号",
      price: "0",
      condition: "成色",
      flawDescription: "",
      supportsOfflineInspection: supportsInspection,
      recommendedHubIds: supportsInspection && selectedHubId ? [selectedHubId] : []
    }),
    [selectedHubId, supportsInspection]
  );

  const errors = validatePublishDraft(draft);

  return (
    <>
      <Text style={styles.screenTitle}>发布闲置装备</Text>
      <Section>
        <Text style={styles.label}>基础信息</Text>
        <TextInput style={styles.input} value="Specialized Tarmac SL7 整车" editable={false} />
        <TextInput style={styles.input} value="品牌、型号、价格、成色、瑕疵说明" editable={false} />
      </Section>
      <Section>
        <View style={styles.row}>
          <Text style={styles.label}>支持线下验货</Text>
          <Switch value={supportsInspection} onValueChange={setSupportsInspection} />
        </View>
        <View style={styles.chips}>
          {hubs
            .filter((hub) => hub.suitableForInspection)
            .map((hub) => (
              <Chip key={hub.id} label={hub.name} selected={hub.id === selectedHubId} onPress={() => setSelectedHubId(hub.id)} />
            ))}
        </View>
      </Section>
      <Section>
        <Text style={styles.label}>发布检查</Text>
        {errors.map((error) => (
          <Text key={error} style={styles.error}>
            {error}
          </Text>
        ))}
        <PrimaryButton label="预览发布" onPress={() => undefined} />
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.md
  },
  label: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    color: colors.muted
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  error: {
    color: colors.coral,
    marginBottom: spacing.sm
  }
});
```

- [ ] **Step 4: Create MessagesScreen**

Create `src/screens/MessagesScreen.tsx`:

```tsx
import { StyleSheet, Text } from "react-native";
import { conversations } from "../data/seed";
import { findListingById } from "../services/catalog";
import { Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

export function MessagesScreen() {
  return (
    <>
      <Text style={styles.screenTitle}>消息</Text>
      {conversations.map((conversation) => {
        const listing = findListingById(conversation.listingId);

        return (
          <Section key={conversation.id}>
            <Text style={styles.title}>{listing?.title ?? "关联商品"}</Text>
            <Text style={styles.preview}>{conversation.lastMessagePreview}</Text>
            <Text style={styles.meta}>状态：已约看</Text>
          </Section>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.md
  },
  title: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  preview: {
    color: colors.ink,
    marginBottom: spacing.sm
  },
  meta: {
    color: colors.muted
  }
});
```

- [ ] **Step 5: Create ProfileScreen**

Create `src/screens/ProfileScreen.tsx`:

```tsx
import { StyleSheet, Text } from "react-native";
import { currentUserId, users } from "../data/seed";
import { getProfileStats } from "../services/catalog";
import { Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

export function ProfileScreen() {
  const user = users.find((item) => item.id === currentUserId);
  const stats = getProfileStats(currentUserId);

  return (
    <>
      <Text style={styles.screenTitle}>我的</Text>
      <Section>
        <Text style={styles.name}>{user?.nickname}</Text>
        <Text style={styles.meta}>{user?.city} · {user?.riderTags.join(" · ")}</Text>
      </Section>
      <Section>
        <Text style={styles.item}>我的发布：{stats.activeListings}</Text>
        <Text style={styles.item}>我的收藏：{stats.favorites}</Text>
        <Text style={styles.item}>我的会话：{stats.conversations}</Text>
        <Text style={styles.item}>据点入驻申请</Text>
        <Text style={styles.item}>举报和反馈</Text>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.md
  },
  name: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: spacing.xs
  },
  meta: {
    color: colors.muted
  },
  item: {
    color: colors.ink,
    fontSize: 15,
    marginBottom: spacing.sm
  }
});
```

- [ ] **Step 6: Wire new screens in App**

Replace `App.tsx` with:

```tsx
import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { HomeScreen } from "./src/screens/HomeScreen";
import { MessagesScreen } from "./src/screens/MessagesScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { PublishScreen } from "./src/screens/PublishScreen";
import { Chip, Section } from "./src/ui/components";
import { colors, spacing } from "./src/ui/theme";

type MainTab = "home" | "map" | "publish" | "messages" | "profile";
type HomeTab = "gear" | "hubs";

const mainTabs: Array<{ id: MainTab; label: string }> = [
  { id: "home", label: "首页" },
  { id: "map", label: "地图" },
  { id: "publish", label: "发布" },
  { id: "messages", label: "消息" },
  { id: "profile", label: "我的" }
];

export default function App() {
  const [mainTab, setMainTab] = useState<MainTab>("home");
  const [homeTab, setHomeTab] = useState<HomeTab>("gear");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.brand}>VeloHive</Text>
        <Text style={styles.region}>上海周边</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>{renderScreen(mainTab, homeTab, setHomeTab)}</ScrollView>
      <View style={styles.bottomTabs}>
        {mainTabs.map((tab) => (
          <Chip key={tab.id} label={tab.label} selected={mainTab === tab.id} onPress={() => setMainTab(tab.id)} />
        ))}
      </View>
    </SafeAreaView>
  );
}

function renderScreen(mainTab: MainTab, homeTab: HomeTab, setHomeTab: (tab: HomeTab) => void) {
  if (mainTab === "home") {
    return <HomeScreen activeTab={homeTab} onChangeTab={setHomeTab} />;
  }
  if (mainTab === "publish") {
    return <PublishScreen />;
  }
  if (mainTab === "messages") {
    return <MessagesScreen />;
  }
  if (mainTab === "profile") {
    return <ProfileScreen />;
  }

  return (
    <Section>
      <Text style={styles.title}>地图</Text>
      <Text style={styles.body}>展示上海周边商品和据点的地图视图。</Text>
    </Section>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.surface
  },
  brand: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800"
  },
  region: {
    color: colors.muted,
    marginTop: spacing.xs
  },
  content: {
    padding: spacing.lg
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  bottomTabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs,
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface
  }
});
```

- [ ] **Step 7: Verify**

Run:

```bash
npm test -- --runTestsByPath __tests__/appSmoke.test.tsx
npm test
npm run typecheck
```

Expected: all tests PASS and typecheck PASS.

- [ ] **Step 8: Commit**

```bash
git add App.tsx src/screens/PublishScreen.tsx src/screens/MessagesScreen.tsx src/screens/ProfileScreen.tsx __tests__/appSmoke.test.tsx
git commit -m "feat: add publish messages and profile screens"
```

---

### Task 8: Document Run Commands and Verify Full Plan Output

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README**

Replace `README.md` with:

```md
# VeloHive

VeloHive 是一个面向上海周边骑友的公路车闲置交易与据点平台。

第一版产品方向：

- 公路车整车和配件闲置交易。
- 商品发布、浏览、搜索、收藏和私聊撮合。
- 咖啡吧、农家乐、车店、骑行驿站等本地据点。
- 支持买卖双方约在据点线下验货。
- 第一版不做平台担保支付，先验证供给、需求和信任机制。

## 开发命令

```bash
npm install
npm start
npm test
npm run typecheck
```

## 文档

- [产品设计文档](docs/superpowers/specs/2026-07-23-road-bike-marketplace-design.md)
- [移动端 MVP 实施计划](docs/superpowers/plans/2026-07-23-velohive-mobile-mvp.md)
```

- [ ] **Step 2: Run final verification**

Run:

```bash
npm test
npm run typecheck
```

Expected: all tests PASS and typecheck PASS.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add development commands"
```

---

## Self-Review Notes

Spec coverage in this plan:

- Listing browsing: covered by Tasks 2, 3, 6.
- Hub discovery: covered by Tasks 2, 3, 6.
- Listing self-verification and trust labels: covered by Tasks 2, 3, 6.
- Publish flow validation with offline inspection hub requirement: covered by Tasks 4 and 7.
- Messages and profile basics: covered by Tasks 2, 3, 7.
- Admin web console: intentionally outside this mobile plan and should receive a separate plan.
- Real backend, authentication, uploaded images, map SDK, and payment: intentionally outside this mobile plan and should receive separate plans after the prototype runs.

Plan quality checks:

- No unresolved blanks are present.
- Type names match the domain modules used by screens and services.
- Each implementation task has test commands and commit commands.

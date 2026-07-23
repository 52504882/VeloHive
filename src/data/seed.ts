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
    imageUrls: ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80"],
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
    imageUrls: ["https://images.unsplash.com/photo-1525102195674-3ad0b706c7a6?auto=format&fit=crop&w=900&q=80"],
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
    imageUrls: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"],
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
    imageUrls: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80"],
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
    imageUrls: ["https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=900&q=80"],
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
    imageUrls: ["https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=900&q=80"],
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

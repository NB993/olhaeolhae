/**
 * 가족 관련 타입 정의
 * 백엔드 엔티티와 일치하도록 정의
 */

export enum FamilyMemberRelationshipType {
  // 직계 가족 (Direct Family)
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  SON = 'SON',
  DAUGHTER = 'DAUGHTER',

  // 조부모/손자 (Grandparents/Grandchildren)
  GRANDFATHER = 'GRANDFATHER',
  GRANDMOTHER = 'GRANDMOTHER',
  GRANDSON = 'GRANDSON',
  GRANDDAUGHTER = 'GRANDDAUGHTER',

  // 형제자매 (Siblings)
  ELDER_BROTHER = 'ELDER_BROTHER',
  ELDER_SISTER = 'ELDER_SISTER',
  YOUNGER_BROTHER = 'YOUNGER_BROTHER',
  YOUNGER_SISTER = 'YOUNGER_SISTER',

  // 배우자 (Spouse)
  HUSBAND = 'HUSBAND',
  WIFE = 'WIFE',

  // 친척 (Relatives)
  UNCLE = 'UNCLE',
  AUNT = 'AUNT',
  NEPHEW = 'NEPHEW',
  NIECE = 'NIECE',
  COUSIN = 'COUSIN',

  // 사용자 정의 (Custom)
  CUSTOM = 'CUSTOM',
}

// 관계 타입별 한글 표시명
export const RELATIONSHIP_TYPE_LABELS: Record<FamilyMemberRelationshipType, string> = {
  [FamilyMemberRelationshipType.FATHER]: '아버지',
  [FamilyMemberRelationshipType.MOTHER]: '어머니',
  [FamilyMemberRelationshipType.SON]: '아들',
  [FamilyMemberRelationshipType.DAUGHTER]: '딸',
  [FamilyMemberRelationshipType.GRANDFATHER]: '할아버지',
  [FamilyMemberRelationshipType.GRANDMOTHER]: '할머니',
  [FamilyMemberRelationshipType.GRANDSON]: '손자',
  [FamilyMemberRelationshipType.GRANDDAUGHTER]: '손녀',
  [FamilyMemberRelationshipType.ELDER_BROTHER]: '형',
  [FamilyMemberRelationshipType.ELDER_SISTER]: '누나/언니',
  [FamilyMemberRelationshipType.YOUNGER_BROTHER]: '남동생',
  [FamilyMemberRelationshipType.YOUNGER_SISTER]: '여동생',
  [FamilyMemberRelationshipType.HUSBAND]: '남편',
  [FamilyMemberRelationshipType.WIFE]: '아내',
  [FamilyMemberRelationshipType.UNCLE]: '삼촌/외삼촌',
  [FamilyMemberRelationshipType.AUNT]: '고모/이모',
  [FamilyMemberRelationshipType.NEPHEW]: '조카',
  [FamilyMemberRelationshipType.NIECE]: '조카딸',
  [FamilyMemberRelationshipType.COUSIN]: '사촌',
  [FamilyMemberRelationshipType.CUSTOM]: '직접 입력',
};

export enum FamilyMemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  SUSPENDED = 'SUSPENDED',
}

export enum FamilyMemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export interface FamilyMember {
  id: number;
  name: string;
  profileImage?: string;
  age: number;
  birthDate: string;
  phoneNumber?: string;
  relationship?: FamilyMemberRelationshipType | string;
  customRelationship?: string;
  isKakaoSynced?: boolean;
  role: FamilyMemberRole;
  status: FamilyMemberStatus;
  address?: string;
  occupation?: string;
  email?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  familyId: number;
  userId?: number;
  joinedAt: string;
  lastActiveAt?: string;
}

export interface Family {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  memberCount: number;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMemberRelationship {
  id: number;
  fromMemberId: number;
  toMemberId: number;
  relationshipType: FamilyMemberRelationshipType;
  customRelationship?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RelationshipSuggestion {
  relationship: FamilyMemberRelationshipType;
  confidence: number;
  reasoning: string;
}

export interface FamilyJoinRequest {
  id: number;
  familyId: number;
  userId: number;
  requestMessage?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  processedAt?: string;
  processedBy?: number;
}

export interface Announcement {
  id: number;
  familyId: number;
  title: string;
  content: string;
  authorId: number;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response 타입
export interface FindFamilyResponse {
  families: Family[];
  totalCount: number;
  hasMore: boolean;
}

export interface FindFamilyMemberResponse {
  members: FamilyMember[];
  totalCount: number;
  hasMore: boolean;
}

// Form 타입
export interface CreateFamilyForm {
  name: string;
  description?: string;
  isPublic: boolean;
}

export interface CreateFamilyMemberForm {
  name: string;
  birthDate: string;
  phoneNumber?: string;
  relationship?: FamilyMemberRelationshipType | string;
  customRelationship?: string;
  address?: string;
  occupation?: string;
  email?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface UpdateFamilyMemberForm extends Partial<CreateFamilyMemberForm> {
  id: number;
}

// 유틸리티 타입
export type FamilyMemberWithRelationships = FamilyMember & {
  relationships: FamilyMemberRelationship[];
};

export type FamilyWithMembers = Family & {
  members: FamilyMember[];
  owner: FamilyMember;
};

// 관계 저장 요청 타입 (백엔드 SaveFamilyMemberRelationshipRequest와 일치)
export interface SaveFamilyMemberRelationshipRequest {
  familyId: number;
  toMemberId: number;
  relationshipType: FamilyMemberRelationshipType;
  customRelationship?: string;
  description?: string;
}

// 관계 저장 응답 타입 (백엔드 FamilyMemberRelationshipResponse와 일치)
export interface SaveFamilyMemberRelationshipResponse {
  id: number;
}
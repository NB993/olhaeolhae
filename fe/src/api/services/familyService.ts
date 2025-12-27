/**
 * 가족 관련 API 서비스
 * 백엔드 Family 도메인 API와 연동
 */

import { ApiClient } from '../client';
import {
  FamilyMemberRelationshipType,
  FamilyMember,
  FamilyMemberRole,
  FamilyMemberStatus,
  FamilyMemberRelationship,
  FamilyJoinRequest,
  Announcement,
  SaveFamilyMemberRelationshipRequest,
  SaveFamilyMemberRelationshipResponse
} from '../../types/family';
import { CursorPageResponse } from '../../types/api';

// Request Types
export interface SaveFamilyRequest {
  name: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  description?: string;
  profileUrl?: string;
}

export interface ModifyFamilyRequest {
  name: string;
  profileUrl?: string;
  description?: string;
}

// Response Types
export interface FindFamilyResponse {
  id: number;
  name: string;
  description?: string;
  profileUrl?: string;
  isPublic: boolean;
  memberCount: number;
  createdAt: string;
  modifiedAt?: string;
}

export interface SaveFamilyResponse {
  familyId: number;
}

export interface PublicFamilyResponse {
  id: number;
  name: string;
  description?: string;
  profileUrl?: string;
  memberCount: number;
  createdAt: string;
}


export interface FamilyNameAvailabilityResponse {
  available: boolean;
  message: string;
}

// 가족 구성원 관련 타입들 - types/family.ts에서 import

export interface FindFamilyMemberResponse {
  members: FamilyMember[];
}

// 가족 홈 구성원 응답 (관계 정보 포함)
export interface FamilyMemberWithRelationship {
  // 구성원 기본 정보
  memberId: number;
  memberName: string;
  memberAge?: number;
  memberBirthday?: string;
  memberPhoneNumber?: string;
  memberProfileImageUrl?: string;
  
  // 관계 정보
  relationshipDisplayName?: string;
  relationshipType?: FamilyMemberRelationshipType;
  customRelationshipName?: string;
  hasRelationship: boolean;
  relationshipSetupRequired: boolean;
  relationshipGuideMessage: string;
  phoneNumberDisplay: string;
  
  // 편의 접근자 (백엔드 응답에서 flatten된 형태)
  member: FamilyMember;
}

// Family Tree Warm 호환 인터페이스 (UI 컴포넌트용)
export interface UIFamilyMember {
  id: string | number;
  name: string;
  profileImage?: string;
  age?: number;
  birthDate?: string;
  phoneNumber?: string;
  relationship?: string;
  customRelationship?: string;
  isKakaoSynced?: boolean;
  role: "ADMIN" | "MEMBER" | "SUSPENDED";
}

export interface CreateFamilyMemberForm {
  name: string;
  profileUrl?: string;
  birthday?: string;
  nationality?: string;
}

export interface UpdateFamilyMemberForm {
  id: number;
  name: string;
  profileUrl?: string;
  birthday?: string;
  nationality?: string;
}

// 가족 관계 관련 타입들 - types/family.ts에서 import


// 가족 가입 요청 관련 타입들 - types/family.ts에서 import
export type FamilyJoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// 가입 요청 생성 요청
export interface SaveFamilyJoinRequestRequest {
  familyId: number;
}

// 가입 요청 생성 응답
export interface SaveFamilyJoinRequestResponse {
  id: number;
}

// 가입 요청 조회 응답
export interface FindFamilyJoinRequestResponse {
  id: number;
  familyId: number;
  requesterId: number;
  requesterName: string;
  requesterEmail?: string;
  status: FamilyJoinRequestStatus;
  requestMessage?: string;
  responseMessage?: string;
  createdAt: string;
  processedAt?: string;
}

// 가입 요청 처리 요청
export interface ProcessFamilyJoinRequestRequest {
  status: FamilyJoinRequestStatus;
  message?: string;
}

// 가입 요청 처리 응답
export interface ProcessFamilyJoinRequestResponse {
  id: number;
  status: FamilyJoinRequestStatus;
  processedAt: string;
}

// 공지사항 관련 타입들 - types/family.ts에서 import

export class FamilyService {
  private static instance: FamilyService;
  private apiClient: ApiClient;

  private constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  public static getInstance(): FamilyService {
    if (!FamilyService.instance) {
      FamilyService.instance = new FamilyService();
    }
    return FamilyService.instance;
  }

  // 가족 관련 API

  /**
   * 내가 속한 가족 목록을 조회합니다.
   */
  public async findMyFamilies(): Promise<FindFamilyResponse[]> {
    return this.apiClient.get<FindFamilyResponse[]>('/api/families/my');
  }

  /**
   * 특정 가족 조회
   */
  public async getFamilyById(id: number): Promise<FindFamilyResponse> {
    return this.apiClient.get<FindFamilyResponse>(`/api/families/${id}`);
  }

  /**
   * 가족명으로 검색
   */
  public async searchFamiliesByName(name: string): Promise<FindFamilyResponse[]> {
    return this.apiClient.get<FindFamilyResponse[]>(`/api/families?name=${encodeURIComponent(name)}`);
  }

  /**
   * 공개 가족 검색 (커서 기반 페이징)
   */
  public async getPublicFamilies(params: {
    keyword?: string;
    cursor?: string;
    size?: number;
  }): Promise<CursorPageResponse<PublicFamilyResponse>> {
    const searchParams = new URLSearchParams();
    if (params.keyword) searchParams.append('keyword', params.keyword);
    if (params.cursor) searchParams.append('cursor', params.cursor);
    if (params.size) searchParams.append('size', params.size.toString());

    return this.apiClient.get<CursorPageResponse<PublicFamilyResponse>>(
      `/api/families/public?${searchParams.toString()}`
    );
  }

  /**
   * 새로운 가족을 생성합니다.
   */
  public async createFamily(request: SaveFamilyRequest): Promise<SaveFamilyResponse> {
    return this.apiClient.post<SaveFamilyResponse>('/api/families', request);
  }

  /**
   * 가족 정보를 수정합니다.
   */
  public async updateFamily(id: number | string, request: ModifyFamilyRequest): Promise<void> {
    return this.apiClient.put(`/api/families/${id}`, request);
  }

  /**
   * 가족명 중복을 확인합니다.
   */
  public async checkFamilyNameAvailability(name: string): Promise<FamilyNameAvailabilityResponse> {
    return this.apiClient.get<FamilyNameAvailabilityResponse>(
      `/api/families/check-name?name=${encodeURIComponent(name)}`
    );
  }

  // 가족 구성원 관련 API

  /**
   * 가족 구성원 목록을 조회합니다 (관계 정보 포함).
   */
  public async findFamilyMembers(familyId: number | string): Promise<FamilyMemberWithRelationship[]> {
    return this.apiClient.get<FamilyMemberWithRelationship[]>(`/api/families/${familyId}/home/members`);
  }

  /**
   * 활성화된 가족 구성원 목록을 조회합니다.
   */
  public async findActiveFamilyMembers(familyId: number | string): Promise<FindFamilyMemberResponse> {
    return this.apiClient.get<FindFamilyMemberResponse>(`/api/families/${familyId}/members/active`);
  }

  /**
   * 가족 구성원 상세 정보를 조회합니다.
   */
  public async findFamilyMemberById(familyId: number | string, memberId: number | string): Promise<FamilyMember> {
    return this.apiClient.get<FamilyMember>(`/api/families/${familyId}/members/${memberId}`);
  }

  /**
   * 새로운 가족 구성원을 추가합니다.
   */
  public async createFamilyMember(familyId: number | string, form: CreateFamilyMemberForm): Promise<FamilyMember> {
    return this.apiClient.post<FamilyMember>(`/api/families/${familyId}/members`, form);
  }

  /**
   * 가족 구성원 정보를 수정합니다.
   */
  public async updateFamilyMember(familyId: number | string, form: UpdateFamilyMemberForm): Promise<FamilyMember> {
    return this.apiClient.put<FamilyMember>(`/api/families/${familyId}/members/${form.id}`, form);
  }

  /**
   * 가족 구성원의 역할을 변경합니다.
   */
  public async updateMemberRole(
    familyId: number | string,
    memberId: number | string,
    role: FamilyMemberRole
  ): Promise<FamilyMember> {
    return this.apiClient.put<FamilyMember>(
      `/api/families/${familyId}/members/${memberId}/role`,
      { role }
    );
  }

  /**
   * 가족 구성원의 상태를 변경합니다.
   */
  public async updateMemberStatus(
    familyId: number | string,
    memberId: number | string,
    status: FamilyMemberStatus
  ): Promise<FamilyMember> {
    return this.apiClient.put<FamilyMember>(
      `/api/families/${familyId}/members/${memberId}/status`,
      { status }
    );
  }

  // 가족 관계 관련 API

  /**
   * 가족 구성원 간의 관계를 조회합니다.
   */
  public async findFamilyRelationships(familyId: number | string): Promise<FamilyMemberRelationship[]> {
    return this.apiClient.get<FamilyMemberRelationship[]>(`/api/families/${familyId}/relationships`);
  }

  /**
   * 새로운 가족 관계를 설정합니다.
   * 백엔드 엔드포인트: POST /api/families/{familyId}/members/{toMemberId}/relationships
   */
  public async saveFamilyMemberRelationship(
    familyId: number | string,
    toMemberId: number | string,
    request: SaveFamilyMemberRelationshipRequest
  ): Promise<SaveFamilyMemberRelationshipResponse> {
    return this.apiClient.post<SaveFamilyMemberRelationshipResponse>(
      `/api/families/${familyId}/members/${toMemberId}/relationships`,
      request
    );
  }

  /**
   * 가족 관계를 수정합니다.
   */
  public async updateFamilyRelationship(
    familyId: number | string,
    relationshipId: number | string,
    relationship: Partial<Pick<FamilyMemberRelationship, 'relationshipType' | 'customRelationship'>>
  ): Promise<FamilyMemberRelationship> {
    return this.apiClient.put<FamilyMemberRelationship>(
      `/api/families/${familyId}/relationships/${relationshipId}`,
      relationship
    );
  }

  // 가족 가입 요청 관련 API

  /**
   * 가족 가입 요청 목록을 조회합니다. (ADMIN/OWNER만 가능)
   */
  public async findFamilyJoinRequests(familyId: number | string): Promise<FindFamilyJoinRequestResponse[]> {
    return this.apiClient.get<FindFamilyJoinRequestResponse[]>(`/api/families/${familyId}/join-requests`);
  }

  /**
   * 가족 가입 요청을 보냅니다.
   */
  public async createFamilyJoinRequest(familyId: number | string): Promise<SaveFamilyJoinRequestResponse> {
    return this.apiClient.post<SaveFamilyJoinRequestResponse>('/api/family-join-requests', {
      familyId: Number(familyId)
    });
  }

  /**
   * 가족 가입 요청을 처리합니다. (승인/거절)
   */
  public async processFamilyJoinRequest(
    familyId: number | string,
    requestId: number | string,
    status: FamilyJoinRequestStatus,
    message?: string
  ): Promise<ProcessFamilyJoinRequestResponse> {
    return this.apiClient.patch<ProcessFamilyJoinRequestResponse>(
      `/api/families/${familyId}/join-requests/${requestId}`,
      { status, message }
    );
  }

  // 공지사항 관련 API

  /**
   * 가족 공지사항 목록을 조회합니다.
   */
  public async findAnnouncements(familyId: number | string): Promise<Announcement[]> {
    return this.apiClient.get<Announcement[]>(`/api/families/${familyId}/announcements`);
  }

  /**
   * 새로운 공지사항을 작성합니다.
   */
  public async createAnnouncement(
    familyId: number | string,
    announcement: Pick<Announcement, 'title' | 'content' | 'isImportant'>
  ): Promise<Announcement> {
    return this.apiClient.post<Announcement>(`/api/families/${familyId}/announcements`, announcement);
  }

  /**
   * 공지사항을 수정합니다.
   */
  public async updateAnnouncement(
    familyId: number | string,
    announcementId: number | string,
    announcement: Partial<Pick<Announcement, 'title' | 'content' | 'isImportant'>>
  ): Promise<Announcement> {
    return this.apiClient.put<Announcement>(
      `/api/families/${familyId}/announcements/${announcementId}`,
      announcement
    );
  }

  /**
   * 공지사항을 삭제합니다.
   */
  public async deleteAnnouncement(familyId: number | string, announcementId: number | string): Promise<void> {
    return this.apiClient.delete<void>(`/api/families/${familyId}/announcements/${announcementId}`);
  }
}
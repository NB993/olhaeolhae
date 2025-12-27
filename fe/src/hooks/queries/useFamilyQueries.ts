/**
 * 가족 관련 React Query 훅들
 * family-tree-warm 프로젝트와 기존 프로젝트의 통합된 Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FamilyService,
  FindFamilyResponse,
  SaveFamilyRequest,
  SaveFamilyResponse,
  ModifyFamilyRequest,
  PublicFamilyResponse,
  FamilyNameAvailabilityResponse,
  CreateFamilyMemberForm,
  UpdateFamilyMemberForm,
  FamilyMemberWithRelationship,
  FindFamilyJoinRequestResponse,
  SaveFamilyJoinRequestResponse,
  ProcessFamilyJoinRequestResponse,
  FamilyJoinRequestStatus
} from '../../api/services/familyService';
import {
  FamilyMember,
  FamilyMemberRole,
  FamilyMemberStatus,
  FamilyMemberRelationship,
  FamilyJoinRequest,
  SaveFamilyMemberRelationshipRequest,
  SaveFamilyMemberRelationshipResponse,
  FamilyMemberRelationshipType
} from '../../types/family';
import { CursorPageResponse } from '../../types/api';

// Type alias for backward compatibility
type CreateFamilyForm = SaveFamilyRequest;

const familyService = FamilyService.getInstance();

// Query Keys
export const familyQueryKeys = {
  all: ['families'] as const,
  lists: () => [...familyQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...familyQueryKeys.lists(), { filters }] as const,
  details: () => [...familyQueryKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...familyQueryKeys.details(), id.toString()] as const,
  
  // 구성원 관련
  members: (familyId: number | string) => [...familyQueryKeys.detail(familyId), 'members'] as const,
  member: (familyId: number | string, memberId: number | string) => [...familyQueryKeys.members(familyId), memberId.toString()] as const,
  activeMembers: (familyId: number | string) => [...familyQueryKeys.detail(familyId), 'active'] as const,
  
  // 관계 관련
  relationships: (familyId: number | string) => [...familyQueryKeys.detail(familyId), 'relationships'] as const,
  
  // 가입 요청 관련
  joinRequests: (familyId: number | string) => [...familyQueryKeys.detail(familyId), 'join-requests'] as const,
  
  // 공지사항 관련
  announcements: (familyId: number | string) => [...familyQueryKeys.detail(familyId), 'announcements'] as const,
  
  // 기타
  nameCheck: (name: string) => ['family-name-check', name] as const,
} as const;

// 가족 목록 조회 훅들

/**
 * 내가 속한 가족 목록을 조회합니다.
 */
export const useMyFamilies = () => {
  return useQuery({
    queryKey: familyQueryKeys.list({ type: 'my' }),
    queryFn: () => familyService.findMyFamilies(),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 공개된 가족 목록을 조회합니다.
 */
export const usePublicFamilies = (params?: {
  keyword?: string;
  cursor?: string;
  size?: number;
}) => {
  return useQuery({
    queryKey: familyQueryKeys.list({ type: 'public', ...params }),
    queryFn: () => familyService.getPublicFamilies(params || {}),
    staleTime: 10 * 60 * 1000, // 10분
  });
};

/**
 * 가족 상세 정보를 조회합니다.
 */
export const useFamilyDetail = (familyId: number) => {
  return useQuery({
    queryKey: familyQueryKeys.detail(familyId.toString()),
    queryFn: () => familyService.getFamilyById(familyId),
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 가족명 중복 확인을 위한 훅입니다.
 */
export const useFamilyNameCheck = (name: string) => {
  return useQuery({
    queryKey: familyQueryKeys.nameCheck(name),
    queryFn: () => familyService.checkFamilyNameAvailability(name),
    enabled: !!name && name.length >= 2,
    staleTime: 0, // 즉시 만료 (항상 최신 상태 확인)
  });
};

// 가족 구성원 조회 훅들

/**
 * 가족 구성원 목록을 조회합니다.
 */
export const useFamilyMembers = (familyId: number | string) => {
  return useQuery({
    queryKey: familyQueryKeys.members(familyId),
    queryFn: () => familyService.findFamilyMembers(familyId.toString()),
    enabled: !!familyId,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

/**
 * 활성화된 가족 구성원 목록을 조회합니다.
 */
export const useActiveFamilyMembers = (familyId: number | string) => {
  return useQuery({
    queryKey: familyQueryKeys.activeMembers(familyId),
    queryFn: () => familyService.findActiveFamilyMembers(familyId.toString()),
    enabled: !!familyId,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

/**
 * 가족 구성원 상세 정보를 조회합니다.
 */
export const useFamilyMemberDetail = (familyId: number | string, memberId: number | string) => {
  return useQuery({
    queryKey: familyQueryKeys.member(familyId, memberId),
    queryFn: () => familyService.findFamilyMemberById(familyId.toString(), memberId.toString()),
    enabled: !!familyId && !!memberId,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 가족 관계 조회 훅들

/**
 * 가족 구성원 간의 관계를 조회합니다.
 */
export const useFamilyRelationships = (familyId: number | string) => {
  return useQuery({
    queryKey: familyQueryKeys.relationships(familyId),
    queryFn: () => familyService.findFamilyRelationships(familyId.toString()),
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 가족 가입 요청 조회 훅들

/**
 * 가족 가입 요청 목록을 조회합니다.
 */
export const useFamilyJoinRequests = (familyId: number | string) => {
  return useQuery({
    queryKey: familyQueryKeys.joinRequests(familyId),
    queryFn: () => familyService.findFamilyJoinRequests(familyId.toString()),
    enabled: !!familyId,
    staleTime: 1 * 60 * 1000, // 1분
  });
};

// 공지사항 조회 훅들

/**
 * 가족 공지사항 목록을 조회합니다.
 */
export const useFamilyAnnouncements = (familyId: number | string) => {
  return useQuery({
    queryKey: familyQueryKeys.announcements(familyId),
    queryFn: () => familyService.findAnnouncements(familyId.toString()),
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// Mutation 훅들

/**
 * 새로운 가족을 생성합니다.
 */
export const useCreateFamily = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (form: CreateFamilyForm) => familyService.createFamily(form),
    onSuccess: () => {
      // 내 가족 목록 무효화
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.list({ type: 'my' }),
      });
    },
  });
};

/**
 * 가족 정보를 수정합니다.
 */
export const useUpdateFamily = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ familyId, form }: { familyId: number; form: ModifyFamilyRequest }) =>
      familyService.updateFamily(familyId, form),
    onSuccess: (_, { familyId }) => {
      // 해당 가족 정보 무효화
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.detail(familyId),
      });
      // 내 가족 목록 무효화
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.list({ type: 'my' }),
      });
    },
  });
};

/**
 * 새로운 가족 구성원을 추가합니다.
 */
export const useCreateFamilyMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ familyId, form }: { familyId: number | string; form: CreateFamilyMemberForm }) =>
      familyService.createFamilyMember(familyId.toString(), form),
    onSuccess: (_, { familyId }) => {
      // 가족 구성원 목록 무효화
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.members(familyId),
      });
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.activeMembers(familyId),
      });
    },
  });
};

/**
 * 가족 구성원 정보를 수정합니다.
 */
export const useUpdateFamilyMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ familyId, form }: { familyId: number | string; form: UpdateFamilyMemberForm }) =>
      familyService.updateFamilyMember(familyId.toString(), form),
    onSuccess: (_, { familyId, form }) => {
      // 해당 구성원 정보 무효화
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.member(familyId, form.id),
      });
      // 가족 구성원 목록 무효화
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.members(familyId),
      });
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.activeMembers(familyId),
      });
    },
  });
};

/**
 * 가족 구성원의 역할을 변경합니다.
 */
export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ familyId, memberId, role }: { familyId: number | string; memberId: number | string; role: FamilyMemberRole }) =>
      familyService.updateMemberRole(familyId.toString(), memberId.toString(), role),
    onSuccess: (_, { familyId, memberId }) => {
      // 해당 구성원 정보 무효화
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.member(familyId, memberId),
      });
      // 가족 구성원 목록 무효화
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.members(familyId),
      });
    },
  });
};

/**
 * 가족 구성원의 상태를 변경합니다.
 */
export const useUpdateMemberStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ familyId, memberId, status }: { familyId: number | string; memberId: number | string; status: FamilyMemberStatus }) =>
      familyService.updateMemberStatus(familyId.toString(), memberId.toString(), status),
    onSuccess: (_, { familyId, memberId }) => {
      // 해당 구성원 정보 무효화
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.member(familyId, memberId),
      });
      // 가족 구성원 목록 무효화
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.members(familyId),
      });
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.activeMembers(familyId),
      });
    },
  });
};

/**
 * 새로운 가족 관계를 설정합니다.
 * 백엔드 API: POST /api/families/{familyId}/members/{toMemberId}/relationships
 */
export const useSaveFamilyMemberRelationship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      familyId,
      toMemberId,
      relationshipType,
      customRelationship,
      description
    }: {
      familyId: number | string;
      toMemberId: number | string;
      relationshipType: FamilyMemberRelationshipType;
      customRelationship?: string;
      description?: string;
    }) => {
      const request: SaveFamilyMemberRelationshipRequest = {
        familyId: Number(familyId),
        toMemberId: Number(toMemberId),
        relationshipType,
        customRelationship,
        description,
      };
      return familyService.saveFamilyMemberRelationship(familyId, toMemberId, request);
    },
    onSuccess: (_, { familyId }) => {
      // 가족 관계 목록 무효화
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.relationships(familyId),
      });
      // 구성원 목록도 업데이트 (관계 정보 포함)
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.members(familyId),
      });
    },
  });
};

/**
 * 가족 가입 요청을 보냅니다.
 */
export const useCreateFamilyJoinRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (familyId: number | string) =>
      familyService.createFamilyJoinRequest(familyId),
    onSuccess: (_, familyId) => {
      // 가입 요청 목록 무효화
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.joinRequests(familyId),
      });
    },
  });
};

/**
 * 가족 가입 요청을 처리합니다.
 */
export const useProcessFamilyJoinRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      familyId, 
      requestId, 
      status, 
      message 
    }: { 
      familyId: number | string; 
      requestId: number | string; 
      status: FamilyJoinRequestStatus; 
      message?: string;
    }) => familyService.processFamilyJoinRequest(familyId, requestId, status, message),
    onSuccess: (_, { familyId }) => {
      // 가입 요청 목록 무효화
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.joinRequests(familyId),
      });
      // 구성원 목록도 업데이트 (승인 시 새 구성원 추가)
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.members(familyId),
      });
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.activeMembers(familyId),
      });
    },
  });
};
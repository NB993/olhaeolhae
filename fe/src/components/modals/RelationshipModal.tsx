import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { FamilyMemberRelationshipType, RELATIONSHIP_TYPE_LABELS } from '../../types/family';
import { Button } from '../common/Button';

interface RelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (relationshipType: FamilyMemberRelationshipType, customRelationship?: string, description?: string) => void;
  memberName: string;
  currentRelationshipType?: FamilyMemberRelationshipType;
  currentCustomRelationship?: string;
}

export const RelationshipModal: React.FC<RelationshipModalProps> = ({
  isOpen,
  onClose,
  onSave,
  memberName,
  currentRelationshipType,
  currentCustomRelationship,
}) => {
  const [selectedType, setSelectedType] = useState<FamilyMemberRelationshipType>(
    currentRelationshipType || FamilyMemberRelationshipType.FATHER
  );
  const [customRelationship, setCustomRelationship] = useState(currentCustomRelationship || '');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedType(currentRelationshipType || FamilyMemberRelationshipType.FATHER);
      setCustomRelationship(currentCustomRelationship || '');
      setDescription('');
    }
  }, [isOpen, currentRelationshipType, currentCustomRelationship]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedType === FamilyMemberRelationshipType.CUSTOM && !customRelationship.trim()) {
      alert('사용자 정의 관계명을 입력해주세요.');
      return;
    }

    onSave(selectedType, customRelationship, description);
    onClose();
  };

  const relationshipGroups = [
    {
      title: '부모',
      types: [FamilyMemberRelationshipType.FATHER, FamilyMemberRelationshipType.MOTHER],
    },
    {
      title: '자녀',
      types: [FamilyMemberRelationshipType.SON, FamilyMemberRelationshipType.DAUGHTER],
    },
    {
      title: '조부모',
      types: [FamilyMemberRelationshipType.GRANDFATHER, FamilyMemberRelationshipType.GRANDMOTHER],
    },
    {
      title: '손자녀',
      types: [FamilyMemberRelationshipType.GRANDSON, FamilyMemberRelationshipType.GRANDDAUGHTER],
    },
    {
      title: '형제자매',
      types: [
        FamilyMemberRelationshipType.ELDER_BROTHER,
        FamilyMemberRelationshipType.ELDER_SISTER,
        FamilyMemberRelationshipType.YOUNGER_BROTHER,
        FamilyMemberRelationshipType.YOUNGER_SISTER,
      ],
    },
    {
      title: '배우자',
      types: [FamilyMemberRelationshipType.HUSBAND, FamilyMemberRelationshipType.WIFE],
    },
    {
      title: '친척',
      types: [
        FamilyMemberRelationshipType.UNCLE,
        FamilyMemberRelationshipType.AUNT,
        FamilyMemberRelationshipType.NEPHEW,
        FamilyMemberRelationshipType.NIECE,
        FamilyMemberRelationshipType.COUSIN,
      ],
    },
    {
      title: '기타',
      types: [FamilyMemberRelationshipType.CUSTOM],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {memberName}님과의 관계 설정
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-6">
            {relationshipGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{group.title}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {group.types.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedType === type
                          ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300'
                      }`}
                    >
                      {RELATIONSHIP_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Custom Relationship Input */}
            {selectedType === FamilyMemberRelationshipType.CUSTOM && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  관계명 입력 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customRelationship}
                  onChange={(e) => setCustomRelationship(e.target.value)}
                  placeholder="예: 친구, 이웃 등"
                  maxLength={50}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {customRelationship.length}/50자
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명 (선택)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="관계에 대한 추가 설명을 입력하세요"
                maxLength={200}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                {description.length}/200자
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              저장
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

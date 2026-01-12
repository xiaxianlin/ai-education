import { useInitialStateModel } from '@/models/initialState';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { AbilityApi } from '../../api';
import type {
  CreateAbilityAtomicRequest,
  UpdateAbilityAtomicRequest,
} from '../../api';

// 只支持小学阶段（1-6年级）
const PRIMARY_GRADES = [1, 2, 3, 4, 5, 6];

const useContainer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subject } = useInitialStateModel();
  
  const [domain, setDomain] = useState<AbilityDomain | null>(null);
  const [loading, setLoading] = useState(true);
  const [atomicsByGrade, setAtomicsByGrade] = useState<Record<number, AbilityAtomic[]>>({});
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [formItem, setFormItem] = useState<AbilityAtomic | null>(null);
  const [formVisible, setFormVisible] = useState(false);

  // 加载能力域信息
  useEffect(() => {
    if (id) {
      setLoading(true);
      AbilityApi.getDomain(Number(id))
        .then((data) => {
          setDomain(data);
          // 加载该能力域下的所有原子能力（只查询1-6年级）
          return Promise.all(
            PRIMARY_GRADES.map((grade) =>
              AbilityApi.searchAtomics({
                subject: data.subject,
                grade,
                domain_code: data.code,
              })
            )
          );
        })
        .then((results) => {
          const byGrade: Record<number, AbilityAtomic[]> = {};
          PRIMARY_GRADES.forEach((grade, index) => {
            byGrade[grade] = results[index];
          });
          setAtomicsByGrade(byGrade);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id, subject]);

  const showForm = (grade: number, item?: AbilityAtomic) => {
    setSelectedGrade(grade);
    setFormItem(item || null);
    setFormVisible(true);
  };

  const handleFormCancel = () => {
    setFormVisible(false);
    setFormItem(null);
    setSelectedGrade(null);
  };

  const handleFormSubmit = async (values: CreateAbilityAtomicRequest | UpdateAbilityAtomicRequest) => {
    if (!domain || selectedGrade === null) return;
    
    if (formItem) {
      // 更新
      await AbilityApi.updateAtomic(
        formItem.id,
        values as UpdateAbilityAtomicRequest
      );
    } else {
      // 创建
      await AbilityApi.createAtomic({
        ...values,
        subject: domain.subject,
        grade: selectedGrade,
        domain_code: domain.code,
      } as CreateAbilityAtomicRequest);
    }
    
    // 重新加载该年级的原子能力
    const data = await AbilityApi.searchAtomics({
      subject: domain.subject,
      grade: selectedGrade,
      domain_code: domain.code,
    });
    setAtomicsByGrade((prev) => ({ ...prev, [selectedGrade]: data }));
    
    handleFormCancel();
  };

  const reloadGradeAtomics = async (grade: number) => {
    if (!domain) return;
    const data = await AbilityApi.searchAtomics({
      subject: domain.subject,
      grade,
      domain_code: domain.code,
    });
    setAtomicsByGrade((prev) => ({ ...prev, [grade]: data }));
  };

  return {
    domain,
    loading,
    atomicsByGrade,
    showForm,
    formVisible,
    formItem,
    selectedGrade,
    handleFormCancel,
    handleFormSubmit,
    reloadGradeAtomics,
    navigate,
    subject,
    PRIMARY_GRADES,
  };
};

export const AbilityDetailModel = createContainer(useContainer);
export const useAbilityDetailModel = AbilityDetailModel.useContainer;

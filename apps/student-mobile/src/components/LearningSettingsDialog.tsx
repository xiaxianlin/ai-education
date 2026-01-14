import { Button, View, YStack, Text, XStack, Spinner } from "tamagui";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Modal, TouchableOpacity, StyleSheet, Pressable, ScrollView } from "react-native";
import { useProfileStore } from "../stores/useProfileStore";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface LearningSettingsDialogProps {
  /** 受控模式：弹窗显示状态 */
  open?: boolean;
  /** 受控模式：弹窗状态变化回调 */
  onOpenChange?: (open: boolean) => void;
  /** 是否为强制设置模式（不能关闭弹窗） */
  required?: boolean;
}

const GRADES = ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"];

interface SelectModalProps {
  visible: boolean;
  title: string;
  options: { label: string; value: string | number }[];
  selectedValue: string | number;
  onSelect: (value: string | number) => void;
  onClose: () => void;
}

function SelectModal({ visible, title, options, selectedValue, onSelect, onClose }: SelectModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.selectModalOverlay} onPress={onClose}>
        <Pressable style={styles.selectModalContent} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.selectModalTitle}>{title}</Text>
          <ScrollView style={styles.selectModalList}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.selectModalItem}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text
                  style={[styles.selectModalItemText, option.value === selectedValue && styles.selectModalItemSelected]}
                >
                  {option.label}
                </Text>
                {option.value === selectedValue && <FontAwesome name="check" color="#2563eb" size={16} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.selectModalCancel} onPress={onClose}>
            <Text style={styles.selectModalCancelText}>取消</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function LearningSettingsDialog({
  open: controlledOpen,
  onOpenChange,
  required = false,
}: LearningSettingsDialogProps) {
  const { loading, fetchProfile, updateSettings, profile } = useProfileStore();
  const { textbooks } = profile;

  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const [internalVisible, setInternalVisible] = useState(false);
  const modalVisible = isControlled ? controlledOpen : internalVisible;
  const setModalVisible = isControlled ? onOpenChange! : setInternalVisible;

  const [localSubject, setLocalSubject] = useState("");
  const [localGrade, setLocalGrade] = useState<number>(1);
  const [localSemester, setLocalSemester] = useState("");

  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [showSemesterPicker, setShowSemesterPicker] = useState(false);

  const [saving, setSaving] = useState(false);

  const { grade, semester, subject } = profile;

  const subjectOptions = useMemo(() => {
    const subjects = new Set(textbooks.map((t: { subject: string }) => t.subject));
    return Array.from(subjects).map((s) => ({ label: s, value: s }));
  }, [textbooks]);

  const gradeOptions = useMemo(() => {
    const grades = new Set(
      textbooks.filter((t: { subject: string }) => t.subject === localSubject).map((t: { grade: number }) => t.grade)
    );
    return Array.from(grades)
      .sort((a: number, b: number) => a - b)
      .map((g) => ({ label: GRADES[g - 1] || `年级`, value: g }));
  }, [textbooks, localSubject]);

  const semesterOptions = useMemo(() => {
    return textbooks
      .filter((t: { subject: string; grade: number }) => t.subject === localSubject && t.grade === localGrade)
      .map((t) => ({ label: t.semester, value: t.semester }));
  }, [textbooks, localSubject, localGrade]);

  // 加载初始数据（仅在非受控模式下自动执行）
  useEffect(() => {
    if (!isControlled) {
      fetchProfile();
    }
  }, [isControlled]);

  // 同步初始值
  useEffect(() => {
    if (modalVisible) {
      setLocalSubject(subject || "");
      setLocalGrade(grade || 1);
      setLocalSemester(semester || "");
    }
  }, [modalVisible, subject, grade, semester]);

  // 非受控模式：检查是否需要自动显示弹窗
  useEffect(() => {
    if (!isControlled && !loading && profile) {
      const hasSettings = !!(grade && semester && subject);
      if (!hasSettings) {
        setInternalVisible(true);
      }
    }
  }, [isControlled, loading, profile, grade, semester, subject]);

  const handleSave = async () => {
    if (!localSubject || !localSemester) {
      alert("请完整填写所有设置项");
      return;
    }

    setSaving(true);
    try {
      await updateSettings({
        grade: localGrade,
        semester: localSemester,
        subject: localSubject,
      });
      setModalVisible(false);
      alert("设置保存成功");
    } catch (error) {
      alert("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = useCallback(() => {
    if (!required) {
      setModalVisible(false);
    }
  }, [required, setModalVisible]);

  const handleSubjectSelect = (value: string | number) => {
    setLocalSubject(value as string);
    setLocalSemester("");
  };

  const handleGradeSelect = (value: string | number) => {
    setLocalGrade(value as number);
    setLocalSemester("");
  };

  const handleSemesterSelect = (value: string | number) => {
    setLocalSemester(value as string);
  };

  const getSelectedText = (
    value: string | number | null | undefined,
    options: { label: string; value: string | number }[]
  ) => {
    if (value === null || value === undefined) return "请选择";
    const found = options.find((o) => o.value === value);
    return found?.label || "请选择";
  };

  // 不渲染任何内容，只提供功能
  if (isControlled) {
    return (
      <>
        <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={handleClose}>
          <Pressable style={styles.modalOverlay} onPress={handleClose}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.title}>学习设置</Text>
              <Text style={styles.description}>
                {required ? "请先完成学习设置，以便我们为您推荐合适的学习内容" : "修改您的学习设置"}
              </Text>

              {loading ? (
                <View padding="$8">
                  <Spinner size="large" />
                </View>
              ) : (
                <YStack space="$4" paddingVertical="$4">
                  <View>
                    <Text style={styles.label}>
                      学科 <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowSubjectPicker(true)}>
                      <Text style={styles.pickerTriggerText}>{getSelectedText(localSubject, subjectOptions)}</Text>
                      <FontAwesome name="chevron-down" color="#666" size={14} />
                    </TouchableOpacity>
                  </View>

                  <View>
                    <Text style={styles.label}>
                      年级 <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowGradePicker(true)}>
                      <Text style={styles.pickerTriggerText}>{getSelectedText(localGrade, gradeOptions)}</Text>
                      <FontAwesome name="chevron-down" color="#666" size={14} />
                    </TouchableOpacity>
                  </View>

                  <View>
                    <Text style={styles.label}>
                      学期 <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowSemesterPicker(true)}>
                      <Text style={styles.pickerTriggerText}>{getSelectedText(localSemester, semesterOptions)}</Text>
                      <FontAwesome name="chevron-down" color="#666" size={14} />
                    </TouchableOpacity>
                  </View>
                </YStack>
              )}

              <XStack space="$4" paddingTop="$4">
                {!required && (
                  <Button flex={1} variant="outlined" onPress={handleClose} disabled={saving}>
                    取消
                  </Button>
                )}
                <Button flex={1} onPress={handleSave} disabled={saving || !localSubject || !localSemester}>
                  {saving ? "保存中..." : "保存"}
                </Button>
              </XStack>
            </Pressable>
          </Pressable>
        </Modal>

        <SelectModal
          visible={showSubjectPicker}
          title="选择学科"
          options={subjectOptions}
          selectedValue={localSubject}
          onSelect={handleSubjectSelect}
          onClose={() => setShowSubjectPicker(false)}
        />

        <SelectModal
          visible={showGradePicker}
          title="选择年级"
          options={gradeOptions}
          selectedValue={localGrade}
          onSelect={handleGradeSelect}
          onClose={() => setShowGradePicker(false)}
        />

        <SelectModal
          visible={showSemesterPicker}
          title="选择学期"
          options={semesterOptions}
          selectedValue={localSemester}
          onSelect={handleSemesterSelect}
          onClose={() => setShowSemesterPicker(false)}
        />
      </>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  required: {
    color: "#ef4444",
  },
  pickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
  },
  pickerTriggerText: {
    fontSize: 16,
    color: "#333",
  },
  selectModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectModalContent: {
    width: "75%",
    maxWidth: 280,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  selectModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 16,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectModalList: {
    maxHeight: 280,
  },
  selectModalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectModalItemText: {
    fontSize: 16,
    color: "#333",
  },
  selectModalItemSelected: {
    color: "#2563eb",
    fontWeight: "600",
  },
  selectModalCancel: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  selectModalCancelText: {
    fontSize: 16,
    color: "#666",
  },
});

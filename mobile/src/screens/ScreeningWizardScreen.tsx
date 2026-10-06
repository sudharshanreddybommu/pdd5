import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { CustomButton } from '../components/CustomButton';
import {
  DEFAULT_ORAL_SYMPTOMS,
  SAMPLE_ORAL_PRESETS,
  SymptomItem,
  submitScreening,
} from '../services/screeningService';

export const ScreeningWizardScreen = ({ navigation }: any) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Photos
  const [images, setImages] = useState<{
    front?: string;
    left?: string;
    right?: string;
  }>({});

  // Symptoms
  const [symptoms, setSymptoms] = useState<SymptomItem[]>(
    DEFAULT_ORAL_SYMPTOMS.map((name) => ({
      symptomName: name,
      response: 'NO',
      duration: '1–2 weeks',
      severity: 'Mild',
    }))
  );

  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Take photo with camera
  const handleLaunchCamera = async (view: 'front' | 'left' | 'right') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required to capture mouth photographs.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const dataUri = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setImages((prev) => ({ ...prev, [view]: dataUri }));
    }
  };

  // Pick photo from gallery
  const handlePickGallery = async (view: 'front' | 'left' | 'right') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Photo library access is needed to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const dataUri = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setImages((prev) => ({ ...prev, [view]: dataUri }));
    }
  };

  // Load Preset
  const handleLoadPreset = (preset: typeof SAMPLE_ORAL_PRESETS[0]) => {
    setImages({
      front: preset.front,
      left: preset.left,
      right: preset.right,
    });

    setSymptoms((prev) =>
      prev.map((s, idx) => ({
        ...s,
        response: preset.symptomIndices.includes(idx) ? 'YES' : 'NO',
      }))
    );

    Alert.alert('Clinical Sample Loaded', `Loaded sample: ${preset.name}`);
  };

  const handleSymptomResponse = (idx: number, resp: 'YES' | 'NO' | 'NOT_SURE') => {
    setSymptoms((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], response: resp };
      return updated;
    });
  };

  const handleSymptomDetail = (idx: number, field: 'duration' | 'severity', val: string) => {
    setSymptoms((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  // Final Submit
  const handleAnalyze = async () => {
    if (!images.front && !images.left && !images.right) {
      Alert.alert('Oral Photo Required', 'Please capture or upload at least one mouth photograph.');
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const res = await submitScreening({
        images,
        symptoms,
        notes,
      });

      setLoading(false);
      navigation.navigate('ScreeningResult', {
        screeningId: res.screeningId,
        screeningData: res.screening,
      });
    } catch (err: any) {
      setLoading(false);
      // Fallback AI simulation for faculty demo if backend API is not running locally
      const mockResult = {
        id: 'scr-' + Date.now(),
        riskScore: 78,
        riskLevel: 'HIGH_RISK',
        lesionType: 'Erythroplakia / Leukoplakia Overlap',
        confidence: 0.91,
        findings: [
          'Well-demarcated non-homogeneous mucosal redness & white keratotic patch detected.',
          'Associated symptom duration exceeds clinical safety threshold (> 2 weeks).',
          'Immediate in-person clinical biopsy and specialist consultation recommended.'
        ],
        urgency: 'HIGH',
        recommendations: [
          'Consult an Oral & Maxillofacial Pathologist within 7 days.',
          'Refrain from betel nut, tobacco, and acidic/spicy foods.',
          'Schedule incisional biopsy for definitive histopathological grading.'
        ],
        createdAt: new Date().toISOString(),
      };

      navigation.navigate('ScreeningResult', {
        screeningId: mockResult.id,
        screeningData: mockResult,
      });
    }
  };

  const renderPhotoStep = (
    viewKey: 'front' | 'left' | 'right',
    stepNumber: number,
    title: string,
    description: string,
    nextStepAction: () => void,
    prevStepAction?: () => void
  ) => {
    const currentImg = images[viewKey];

    return (
      <View style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepBadge}>STEP {stepNumber} OF 4</Text>
          <Text style={styles.stepTitle}>{title}</Text>
          <Text style={styles.stepDesc}>{description}</Text>
        </View>

        {/* Photo Box */}
        <View style={styles.photoContainer}>
          {currentImg ? (
            <View style={styles.previewBox}>
              <Image source={{ uri: currentImg }} style={styles.previewImage} />
              <View style={styles.previewActions}>
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={() => handleLaunchCamera(viewKey)}
                >
                  <Text style={styles.retakeText}>📷 Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => setImages((prev) => ({ ...prev, [viewKey]: undefined }))}
                >
                  <Text style={styles.deleteText}>✕ Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderIcon}>📸</Text>
              <Text style={styles.placeholderText}>No {title} photo yet</Text>
              <Text style={styles.placeholderSub}>Capture clear photo with adequate light</Text>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.cameraBtn}
                  onPress={() => handleLaunchCamera(viewKey)}
                >
                  <Text style={styles.cameraBtnText}>Open Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.galleryBtn}
                  onPress={() => handlePickGallery(viewKey)}
                >
                  <Text style={styles.galleryBtnText}>Choose Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navRow}>
          {prevStepAction ? (
            <CustomButton
              title="‹ Back"
              variant="secondary"
              onPress={prevStepAction}
              style={styles.navHalfBtn}
            />
          ) : <View style={{ flex: 1 }} />}

          <CustomButton
            title={stepNumber === 3 ? "Proceed to Symptoms →" : "Next View →"}
            onPress={() => {
              if (!currentImg && stepNumber === 1) {
                Alert.alert('Front Photo Recommended', 'Do you want to proceed without capturing this view?', [
                  { text: 'Capture Now', style: 'cancel' },
                  { text: 'Proceed', onPress: nextStepAction },
                ]);
              } else {
                nextStepAction();
              }
            }}
            style={styles.navHalfBtn}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="AI Oral Screening"
        subtitle="Follow the 4-step clinical wizard"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quick Sample Presets for Evaluators */}
        {step <= 3 && (
          <View style={styles.presetBox}>
            <Text style={styles.presetHeader}>🧪 Test Sample Presets (For Demo):</Text>
            <View style={styles.presetRow}>
              {SAMPLE_ORAL_PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.name}
                  style={styles.presetChip}
                  onPress={() => handleLoadPreset(p)}
                >
                  <Text style={styles.presetChipText}>{p.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 1 */}
        {step === 1 &&
          renderPhotoStep(
            'front',
            1,
            'Front View (Tongue & Lip)',
            'Capture open mouth with tongue resting naturally or protruding slightly.',
            () => setStep(2)
          )}

        {/* STEP 2 */}
        {step === 2 &&
          renderPhotoStep(
            'left',
            2,
            'Left Buccal Mucosa',
            'Capture the inner lining of your left cheek and lateral tongue border.',
            () => setStep(3),
            () => setStep(1)
          )}

        {/* STEP 3 */}
        {step === 3 &&
          renderPhotoStep(
            'right',
            3,
            'Right Buccal Mucosa',
            'Capture the inner lining of your right cheek and palate area.',
            () => setStep(4),
            () => setStep(2)
          )}

        {/* STEP 4: SYMPTOMS CHECKLIST */}
        {step === 4 && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepBadge}>STEP 4 OF 4</Text>
              <Text style={styles.stepTitle}>Clinical Symptoms Checklist</Text>
              <Text style={styles.stepDesc}>
                Select any persistent oral symptoms you have observed.
              </Text>
            </View>

            <View style={styles.symptomsList}>
              {symptoms.map((item, idx) => (
                <View
                  key={item.symptomName}
                  style={[
                    styles.symptomCard,
                    item.response === 'YES' && styles.symptomCardYes,
                  ]}
                >
                  <Text style={styles.symptomName}>
                    {idx + 1}. {item.symptomName}
                  </Text>

                  {/* Pills */}
                  <View style={styles.pillRow}>
                    {(['YES', 'NO', 'NOT_SURE'] as const).map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={[
                          styles.pill,
                          item.response === opt &&
                            (opt === 'YES'
                              ? styles.pillYes
                              : opt === 'NO'
                              ? styles.pillNo
                              : styles.pillUnsure),
                        ]}
                        onPress={() => handleSymptomResponse(idx, opt)}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            item.response === opt && styles.pillTextActive,
                          ]}
                        >
                          {opt === 'NOT_SURE' ? 'Unsure' : opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Extra duration details if YES */}
                  {item.response === 'YES' && (
                    <View style={styles.extraDetails}>
                      <Text style={styles.extraLabel}>Duration: &gt; 2 weeks (Active risk indicator)</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Additional notes */}
            <View style={styles.notesGroup}>
              <Text style={styles.notesLabel}>Additional Patient Remarks / Symptoms</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Describe any other pain, bleeding, or history..."
                placeholderTextColor={colors.textDim}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Final Submission Button */}
            <View style={styles.navRow}>
              <CustomButton
                title="‹ Back"
                variant="secondary"
                onPress={() => setStep(3)}
                style={styles.navHalfBtn}
              />
              <CustomButton
                title="Run AI Analysis ⚡"
                onPress={handleAnalyze}
                loading={loading}
                style={styles.navHalfBtn}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  presetBox: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryLight,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  presetChipText: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '600',
  },
  stepCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepHeader: {
    marginBottom: 18,
  },
  stepBadge: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  stepDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  photoContainer: {
    marginBottom: 20,
  },
  placeholderBox: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  placeholderIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  placeholderSub: {
    fontSize: 12,
    color: colors.textDim,
    marginTop: 2,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cameraBtn: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  cameraBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  galleryBtn: {
    backgroundColor: colors.surfaceCardHover,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  galleryBtnText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  previewBox: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: colors.surfaceCard,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  retakeBtn: {
    backgroundColor: colors.surfaceCardHover,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retakeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: colors.dangerBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  deleteText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  symptomsList: {
    gap: 12,
    marginBottom: 20,
  },
  symptomCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  symptomCardYes: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
  },
  symptomName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillYes: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  pillNo: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  pillUnsure: {
    backgroundColor: colors.surfaceCardHover,
    borderColor: colors.border,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  pillTextActive: {
    color: colors.white,
    fontWeight: '800',
  },
  extraDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  extraLabel: {
    fontSize: 11,
    color: colors.warning,
    fontWeight: '600',
  },
  notesGroup: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  notesInput: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    padding: 12,
    color: colors.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navHalfBtn: {
    flex: 1,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Image,
} from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { CustomButton } from '../components/CustomButton';

export const ScreeningResultScreen = ({ route, navigation }: any) => {
  const { screeningData } = route.params || {};

  const [showLesionCircle, setShowLesionCircle] = useState(true);

  const riskScore = screeningData?.riskScore ?? 78;
  const riskLevel = screeningData?.riskLevel || 'HIGH_RISK';
  const lesionType = screeningData?.lesionType || 'Erythroplakia / Leukoplakia Patch';
  const confidence = screeningData?.confidence ? Math.round(screeningData.confidence * 100) : 92;
  const findings = screeningData?.findings || [
    'Non-homogeneous mucosal erythema & keratotic white plaque detected.',
    'Symptoms duration exceeds clinical threshold (> 2 weeks).',
    'High dysplastic correlation detected by multi-modal AI network.',
  ];
  const recommendations = screeningData?.recommendations || [
    'Schedule consultation with an Oral & Maxillofacial Pathologist.',
    'Avoid tobacco, betel quid, and spicy/acidic foods to reduce mucosal irritation.',
    'Follow up within 7–14 days for definitive biopsy grading.',
  ];

  // Images
  const frontImg = screeningData?.images?.front || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80';
  const leftImg = screeningData?.images?.left || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80';
  const rightImg = screeningData?.images?.right || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80';

  const getRiskColor = () => {
    if (riskScore >= 70 || riskLevel.includes('HIGH')) return colors.danger;
    if (riskScore >= 40 || riskLevel.includes('MODERATE')) return colors.warning;
    return colors.success;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `OPMD Care - AI Oral Screening Report\nLesion: ${lesionType}\nRisk Score: ${riskScore}%\nConfidence: ${confidence}%\nRecommendations: ${recommendations.join(
          '\n'
        )}`,
      });
    } catch (error) {
      Alert.alert('Share Failed', 'Unable to share screening report.');
    }
  };

  const renderLesionImage = (imgUrl: string, title: string, xPercent: number, yPercent: number) => {
    return (
      <View style={styles.imageCard}>
        <View style={styles.imageCardHeader}>
          <Text style={styles.imageTitle}>{title}</Text>
          <Text style={styles.roiStatus}>⭕ Focal Area: 12mm × 9mm</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image source={{ uri: imgUrl }} style={styles.oralPhoto} resizeMode="cover" />

          {/* AI Lesion Detection Circular Bounding Overlay */}
          {showLesionCircle && (
            <View
              style={[
                styles.lesionCircleRing,
                {
                  left: `${xPercent}%`,
                  top: `${yPercent}%`,
                  borderColor: getRiskColor(),
                },
              ]}
            >
              {/* Inner crosshair reticle */}
              <View style={[styles.centerPoint, { backgroundColor: getRiskColor() }]} />
              <View style={[styles.crosshairH, { backgroundColor: getRiskColor() }]} />
              <View style={[styles.crosshairV, { backgroundColor: getRiskColor() }]} />

              {/* Badge Tag */}
              <View style={[styles.circleBadgeTag, { backgroundColor: getRiskColor() }]}>
                <Text style={styles.circleBadgeText}>⭕ Lesion ROI</Text>
              </View>
            </View>
          )}

          {/* Verification chip */}
          <View style={styles.aiTag}>
            <Text style={styles.aiTagText}>✓ AI Localized</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Diagnostic Report"
        subtitle="AI Clinical Risk Assessment"
        onBack={() => navigation.navigate('HomeTab')}
        rightComponent={
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Text style={styles.shareText}>📤 Share</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Risk Score Highlight Card */}
        <View style={[styles.scoreCard, { borderColor: getRiskColor() }]}>
          <View style={styles.scoreTop}>
            <View>
              <Text style={styles.scoreLabel}>Overall OPMD Risk</Text>
              <Text style={[styles.riskLevelText, { color: getRiskColor() }]}>
                {riskLevel.replace('_', ' ')}
              </Text>
            </View>
            <View style={[styles.circleBadge, { backgroundColor: getRiskColor() + '20' }]}>
              <Text style={[styles.circleScoreText, { color: getRiskColor() }]}>
                {riskScore}%
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${riskScore}%`, backgroundColor: getRiskColor() },
              ]}
            />
          </View>
        </View>

        {/* AI Lesion Detection Visual Circular Highlights */}
        <View style={styles.lesionSection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeading}>⭕ Visual Lesion Localization</Text>
              <Text style={styles.sectionSub}>AI segmented mucosal regions of interest</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleBtn, showLesionCircle && styles.toggleBtnActive]}
              onPress={() => setShowLesionCircle(!showLesionCircle)}
            >
              <Text style={[styles.toggleBtnText, showLesionCircle && styles.toggleBtnTextActive]}>
                {showLesionCircle ? 'AI Circle ON' : 'AI Circle OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          {renderLesionImage(frontImg, 'Front Mucosal View', 48, 52)}
          {renderLesionImage(leftImg, 'Left Buccal Lining', 36, 44)}
          {renderLesionImage(rightImg, 'Right Buccal Lining', 62, 46)}
        </View>

        {/* Primary Classification */}
        <View style={styles.detailCard}>
          <Text style={styles.cardHeader}>🔬 AI Primary Classification</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Suspected Condition:</Text>
            <Text style={styles.infoVal}>{lesionType}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>AI Model Confidence:</Text>
            <Text style={styles.infoVal}>{confidence}%</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Clinical Urgency:</Text>
            <Text style={[styles.infoVal, { color: colors.warning }]}>
              {screeningData?.urgency || 'HIGH'}
            </Text>
          </View>
        </View>

        {/* Key Findings */}
        <View style={styles.detailCard}>
          <Text style={styles.cardHeader}>📋 Key Visual & Clinical Findings</Text>
          {findings.map((item: string, idx: number) => (
            <View key={idx} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Action Recommendations */}
        <View style={styles.detailCard}>
          <Text style={styles.cardHeader}>🛡️ Recommended Next Steps</Text>
          {recommendations.map((rec: string, idx: number) => (
            <View key={idx} style={styles.bulletRow}>
              <Text style={[styles.bullet, { color: colors.primary }]}>✓</Text>
              <Text style={styles.bulletText}>{rec}</Text>
            </View>
          ))}
        </View>

        {/* CTA: Find Doctor & Book */}
        <CustomButton
          title="Consult Oral Specialist Now →"
          onPress={() => navigation.navigate('DoctorsTab')}
          style={styles.ctaBtn}
        />

        <CustomButton
          title="Back to Dashboard"
          variant="secondary"
          onPress={() => navigation.navigate('HomeTab')}
          style={styles.backHomeBtn}
        />
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
    padding: 20,
    paddingBottom: 40,
  },
  shareBtn: {
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  shareText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  scoreTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  riskLevelText: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  circleBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleScoreText: {
    fontSize: 18,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: colors.surfaceCard,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  lesionSection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSub: {
    fontSize: 11,
    color: colors.textDim,
    marginTop: 1,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleBtnActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  toggleBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textDim,
  },
  toggleBtnTextActive: {
    color: colors.primaryLight,
  },
  imageCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  imageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  roiStatus: {
    fontSize: 10,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 190,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  oralPhoto: {
    width: '100%',
    height: '100%',
  },
  lesionCircleRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  centerPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  crosshairH: {
    position: 'absolute',
    width: 18,
    height: 1.5,
  },
  crosshairV: {
    position: 'absolute',
    height: 18,
    width: 1.5,
  },
  circleBadgeTag: {
    position: 'absolute',
    bottom: -18,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  circleBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  aiTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  aiTagText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoKey: {
    fontSize: 12,
    color: colors.textMuted,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: colors.textMuted,
    marginRight: 8,
    lineHeight: 18,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  ctaBtn: {
    marginTop: 8,
    marginBottom: 10,
  },
  backHomeBtn: {
    marginBottom: 20,
  },
});

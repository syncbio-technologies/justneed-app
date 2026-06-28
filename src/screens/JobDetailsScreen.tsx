import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseJobDescription } from '../utils/formatDescription';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TOKEN_KEY = '@justneed_token';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  blue: '#185FA5',
  blueSoft: '#E6F1FB',
  blueLight: '#B5D4F4',
  green: '#3B6D11',
  greenSoft: '#EAF3DE',
  text: '#1A1A1A',
  sub: '#555555',
  muted: '#888888',
  border: '#E4E4E4',
  surface: '#F7F7F7',
  white: '#FFFFFF',
};

interface JobDetailsScreenProps {
  route: any;
  navigation: any;
}

export default function JobDetailsScreen({ route, navigation }: JobDetailsScreenProps) {
  const { jobId, isApplied = false, appliedDate } = route.params;
  const insets = useSafeAreaInsets();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => { loadJobDetails(); }, [jobId]);

  const loadJobDetails = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setJob(data);
      setIsSaved(data.is_saved);
    } catch {
      Alert.alert('Error', 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      await fetch(`${API_BASE}/swipes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId, direction: 'like' }),
      });
      Alert.alert('Success', 'Application submitted!');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to apply');
    }
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (isSaved) {
        await fetch(`${API_BASE}/saved/${jobId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsSaved(false);
      } else {
        await fetch(`${API_BASE}/saved`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobId }),
        });
        setIsSaved(true);
      }
    } catch {
      Alert.alert('Error', 'Failed to save job');
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={T.blue} />
        <Text style={s.loadingText}>Fetching job details…</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={s.center}>
        <Ionicons name="alert-circle-outline" size={48} color={T.muted} />
        <Text style={s.errorText}>Job not found</Text>
      </View>
    );
  }

  const descriptionText = job.description_text || job.description || '';
  const location = job.municipality || job.region || 'Sweden';
  const deadline = job.application_deadline
    ? new Date(job.application_deadline).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
    : null;

  const appliedOn = appliedDate
    ? new Date(appliedDate).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
    : null;

  const hasRequirements =
    job.experience_required || job.driving_license_required || job.access_to_own_car;

  const logoInitial = (job.employer_name || job.headline || 'J')[0].toUpperCase();

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.white} />

      {/* ── Navigation Bar ── */}
      <View style={[s.nav, { paddingTop: Math.max(insets.top, 18) }]}>
        <TouchableOpacity style={s.navIconBtn} onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={20} color={T.text} />
        </TouchableOpacity>
        <Text style={s.navTitle} numberOfLines={1}>Job Details</Text>
        <TouchableOpacity style={s.navIconBtn} onPress={handleSave} hitSlop={10}>
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={22}
            color={isSaved ? '#FF4D6D' : T.sub}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Card ── */}
        <View style={s.card}>
          <View style={s.logoRow}>
            <View style={s.logoBox}>
              <Text style={s.logoLetter}>{logoInitial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              {job.employer_name && (
                <Text style={s.companyName}>{job.employer_name}</Text>
              )}
              <Text style={s.locationText}>{location}</Text>
            </View>
          </View>

          <Text style={s.jobTitle}>{job.headline}</Text>

          <View style={s.pillRow}>
            <InfoPill icon="location-outline" label={location} />
            {job.employment_type_label && (
              <InfoPill icon="time-outline" label={job.employment_type_label} />
            )}
            {job.occupation_label && (
              <InfoPill icon="layers-outline" label={job.occupation_label} />
            )}
          </View>
        </View>

        {/* ── Stats Strip ── */}
        <View style={s.statsStrip}>
          {job.salary_description && (
            <StatItem icon="cash-outline" label="Salary" value={job.salary_description} last={false} />
          )}
          {appliedOn ? (
            <StatItem icon="checkmark-circle-outline" label="Applied on" value={appliedOn} last={false} />
          ) : deadline ? (
            <StatItem icon="calendar-outline" label="Apply by" value={deadline} last={false} />
          ) : null}
          <StatItem
            icon="trending-up-outline"
            label="Experience"
            value={job.experience_required ? 'Required' : 'Fresher OK'}
            last
          />
        </View>

        {/* ── Requirements ── */}
        {hasRequirements && (
          <SectionCard title="Requirements">
            <View style={s.reqGrid}>
              {job.experience_required && (
                <ReqChip icon="ribbon-outline" label="Experience" />
              )}
              {job.driving_license_required && (
                <ReqChip icon="car-outline" label="Driving License" />
              )}
              {job.access_to_own_car && (
                <ReqChip icon="car-sport-outline" label="Own Car" />
              )}
            </View>
          </SectionCard>
        )}

        {/* ── Job Description ── */}
        {!!descriptionText && (
          <SectionCard title="Job Description">
            {parseJobDescription(descriptionText).map((section: any, i: number) => (
              <Text key={i} style={s.descText}>
                {section.content}
              </Text>
            ))}
          </SectionCard>
        )}

        {/* ── How to Apply ── */}
        {(job.application_email || job.application_url || job.webpage_url) && (
          <SectionCard title="How to Apply">
            {job.application_email ? (
              <TouchableOpacity 
                style={s.contactRow}
                onPress={() => {
                  import('react-native').then(({ Linking }) => {
                    Linking.openURL(`mailto:${job.application_email}`).catch(() => 
                      Alert.alert('Error', 'Could not open the email client.')
                    );
                  });
                }}
              >
                <Ionicons name="mail-outline" size={16} color={T.blue} />
                <Text style={[s.contactText, { textDecorationLine: 'underline' }]}>{job.application_email}</Text>
              </TouchableOpacity>
            ) : (job.application_url || job.webpage_url) ? (
              <TouchableOpacity 
                style={[s.contactRow, { marginBottom: 0 }]}
                onPress={() => {
                  import('react-native').then(({ Linking }) => {
                    Linking.openURL(job.application_url || job.webpage_url).catch(() => 
                      Alert.alert('Error', 'Could not open the application link.')
                    );
                  });
                }}
              >
                <Ionicons name="link-outline" size={16} color={T.blue} />
                <Text style={[s.contactText, { textDecorationLine: 'underline' }]} numberOfLines={2}>
                  Apply on company website
                </Text>
              </TouchableOpacity>
            ) : null}
          </SectionCard>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Footer ── */}
      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.75}>
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={18}
            color={isSaved ? '#FF4D6D' : T.blue}
          />

          <Text
            style={[
              s.saveBtnText,
              { color: isSaved ? '#FF4D6D' : T.blue }
            ]}
          >
            {isSaved ? 'Liked' : 'Like'}
          </Text>
        </TouchableOpacity>

        {isApplied ? (
          <View style={s.appliedBtn}>
            <Ionicons name="checkmark-circle" size={18} color={T.blue} />
            <Text style={s.appliedBtnText}>Applied</Text>
          </View>
        ) : (
          <TouchableOpacity style={s.applyBtn} onPress={handleApply} activeOpacity={0.85}>
            <Text style={s.applyBtnText}>Apply Now</Text>
            <Ionicons name="arrow-forward" size={16} color={T.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.card}>
      <View style={s.cardTitleRow}>
        <View style={s.cardTitleBar} />
        <Text style={s.cardTitleText}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function InfoPill({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={s.pill}>
      <Ionicons name={icon} size={12} color={T.blue} />
      <Text style={s.pillText}>{label}</Text>
    </View>
  );
}

function StatItem({
  icon, label, value, last,
}: { icon: any; label: string; value: string; last: boolean }) {
  return (
    <View style={[s.statItem, last && { borderRightWidth: 0 }]}>
      <Ionicons name={icon} size={18} color={T.blue} />
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
    </View>
  );
}

function ReqChip({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={s.reqChip}>
      <Ionicons name={icon} size={13} color={T.blue} />
      <Text style={s.reqChipText}>{label}</Text>
    </View>
  );
}

// ─── StyleSheet ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.surface },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: T.white,
    gap: 12,
  },
  loadingText: { fontSize: 13, color: T.muted },
  errorText: { fontSize: 14, color: T.muted },

  // Nav
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: T.white,
    borderBottomWidth: 0.5,
    borderBottomColor: T.border,
  },
  navIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
    color: T.text,
    marginHorizontal: 8,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },

  // Card base
  card: {
    backgroundColor: T.white,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: T.border,
    padding: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitleBar: {
    width: 3,
    height: 16,
    backgroundColor: T.blue,
    marginRight: 8,
  },
  cardTitleText: { fontSize: 14, fontWeight: '500', color: T.text },

  // Hero
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: T.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: T.blueLight,
  },
  logoLetter: { fontSize: 20, fontWeight: '500', color: T.blue },
  companyName: { fontSize: 14, fontWeight: '500', color: T.text },
  locationText: { fontSize: 12, color: T.muted, marginTop: 2 },
  newBadge: {
    backgroundColor: T.greenSoft,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  newBadgeText: { fontSize: 11, color: T.green, fontWeight: '500' },
  jobTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: T.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: T.surface,
    borderWidth: 0.5,
    borderColor: T.border,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillText: { fontSize: 12, color: T.sub },

  // Stats Strip
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: T.white,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: T.border,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 3,
    borderRightWidth: 0.5,
    borderRightColor: T.border,
  },
  statLabel: {
    fontSize: 10,
    color: T.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '500',
    color: T.text,
    textAlign: 'center',
  },

  // Requirements
  reqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reqChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: T.blueSoft,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reqChipText: { fontSize: 12, color: T.blue, fontWeight: '500' },

  // Description
  descText: { fontSize: 14, lineHeight: 22, color: T.sub, marginBottom: 6 },

  // Contact
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: T.blueSoft,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  contactText: { flex: 1, fontSize: 13, color: T.blue, fontWeight: '500' },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    backgroundColor: T.white,
    borderTopWidth: 0.5,
    borderTopColor: T.border,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: T.blue,
  },
  saveBtnText: { fontSize: 13, fontWeight: '500', color: T.blue },
  applyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: T.blue,
    paddingVertical: 13,
    borderRadius: 10,
  },
  applyBtnText: { fontSize: 14, fontWeight: '500', color: T.white },
  appliedBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: T.white,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: T.blue,
  },
  appliedBtnText: { fontSize: 14, fontWeight: '500', color: T.blue },
});
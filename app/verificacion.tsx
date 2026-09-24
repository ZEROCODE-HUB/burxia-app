import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

import { spacing, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button, AlertDialog } from '../components/ui';
import { KYB_SECTIONS, KYB_DOCUMENTS, KybField } from '../constants/kybForm';
import { getMyKyb, getMyKybDocs, uploadKybDoc, submitKyb, KybSubmission } from '../services/kyb.service';

export default function VerificacionScreen() {
  const { colors } = useTheme();
  const { refreshUser, logout } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<KybSubmission | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [docs, setDocs] = useState<Record<string, { fileName: string | null; uploading?: boolean }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState<{ visible: boolean; title: string; description: string }>({ visible: false, title: '', description: '' });

  const showAlert = (title: string, description: string) => setAlert({ visible: true, title, description });

  const load = useCallback(async () => {
    try {
      const [sub, dl] = await Promise.all([getMyKyb(), getMyKybDocs()]);
      setSubmission(sub);
      if (sub?.answers) setAnswers(sub.answers);
      const map: Record<string, { fileName: string | null }> = {};
      dl.forEach((d) => { map[d.doc_type] = { fileName: d.file_name }; });
      setDocs(map);
    } catch (e: any) {
      console.error('[kyb] load', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setField = (id: string, value: any) => setAnswers((p) => ({ ...p, [id]: value }));

  const pickDoc = async (docType: string) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true, multiple: false });
      if (res.canceled || !res.assets?.length) return;
      const asset = res.assets[0];
      setDocs((p) => ({ ...p, [docType]: { fileName: asset.name, uploading: true } }));
      await uploadKybDoc(docType, asset.uri, asset.name);
      setDocs((p) => ({ ...p, [docType]: { fileName: asset.name, uploading: false } }));
    } catch (e: any) {
      setDocs((p) => ({ ...p, [docType]: { ...(p[docType] || { fileName: null }), uploading: false } }));
      showAlert('Error', e?.message || 'No se pudo subir el documento.');
    }
  };

  const validate = (): string | null => {
    for (const section of KYB_SECTIONS) {
      for (const f of section.fields) {
        if (f.required && !String(answers[f.id] ?? '').trim()) return `Completá "${f.label}".`;
      }
    }
    for (const d of KYB_DOCUMENTS) {
      if (d.required && !docs[d.id]?.fileName) return `Subí el documento "${d.label}".`;
    }
    if (answers['decl_antilavado'] !== 'Autorizo' || answers['decl_habeas_data'] !== 'Autorizo') {
      return 'Debés autorizar ambas declaraciones legales para continuar.';
    }
    return null;
  };

  const onSubmit = async () => {
    const err = validate();
    if (err) { showAlert('Faltan datos', err); return; }
    setSubmitting(true);
    try {
      await submitKyb(answers);
      await load();
    } catch (e: any) {
      showAlert('Error', e?.message || 'No se pudo enviar el formulario.');
    } finally {
      setSubmitting(false);
    }
  };

  const onRefreshStatus = async () => {
    setRefreshing(true);
    try {
      await refreshUser();          // si ya fue aprobado, el gate lo lleva a la app
      await load();                 // si fue rechazado, muestra el motivo
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Estado: EN REVISIÓN --------------------------------------------------------
  if (submission?.status === 'submitted') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.statusWrap}>
          <View style={[styles.statusIcon, { backgroundColor: colors.warningAlpha[20] }]}>
            <Ionicons name="hourglass-outline" size={40} color={colors.warning} />
          </View>
          <Text style={styles.statusTitle}>Tu cuenta está en revisión</Text>
          <Text style={styles.statusText}>
            Recibimos tu formulario de vinculación. Nuestro equipo lo está revisando; te avisaremos por notificación cuando tu cuenta quede activa.
          </Text>
          <Button onPress={onRefreshStatus} loading={refreshing} style={{ width: '100%', marginTop: spacing.lg }}>
            Actualizar estado
          </Button>
          <TouchableOpacity onPress={logout} style={{ marginTop: spacing.lg }}>
            <Text style={styles.link}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
        <AlertDialog visible={alert.visible} title={alert.title} description={alert.description}
          onConfirm={() => setAlert((p) => ({ ...p, visible: false }))} onClose={() => setAlert((p) => ({ ...p, visible: false }))} />
      </SafeAreaView>
    );
  }

  // Estado: FORMULARIO (nuevo o rechazado) ------------------------------------
  const rejected = submission?.status === 'rejected';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <Text style={styles.title}>Verificación de cuenta</Text>
          <Text style={styles.subtitle}>
            Para operar en Burxia necesitamos vincular tu persona jurídica. Completá el formulario y adjuntá los documentos; un operador revisará la solicitud.
          </Text>

          {rejected && (
            <View style={styles.rejectedBanner}>
              <Ionicons name="alert-circle-outline" size={20} color={colors.destructive} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rejectedTitle}>Tu verificación necesita correcciones</Text>
                {submission?.admin_notes ? <Text style={styles.rejectedReason}>Motivo: {submission.admin_notes}</Text> : null}
              </View>
            </View>
          )}

          {KYB_SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.subtitle ? <Text style={styles.sectionSub}>{section.subtitle}</Text> : null}
              {section.fields.map((f) => (
                <Field key={f.id} field={f} value={answers[f.id]} onChange={(v) => setField(f.id, v)} colors={colors} styles={styles} />
              ))}
            </View>
          ))}

          {/* Documentos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Anexo documental</Text>
            <Text style={styles.sectionSub}>Adjuntá cada documento en PDF (máx. 10 MB).</Text>
            {KYB_DOCUMENTS.map((d) => {
              const st = docs[d.id];
              const done = !!st?.fileName;
              return (
                <View key={d.id} style={styles.docRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.docLabel}>{d.label}{d.required ? ' *' : ''}</Text>
                    {done ? <Text style={styles.docFile} numberOfLines={1}>{st?.fileName}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => pickDoc(d.id)} disabled={st?.uploading} style={[styles.docBtn, done && styles.docBtnDone]}>
                    {st?.uploading ? (
                      <ActivityIndicator size="small" color={colors.accent} />
                    ) : (
                      <>
                        <Ionicons name={done ? 'checkmark-circle' : 'cloud-upload-outline'} size={16} color={done ? colors.success : colors.accent} />
                        <Text style={[styles.docBtnText, done && { color: colors.success }]}>{done ? 'Reemplazar' : 'Subir'}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <Button onPress={onSubmit} loading={submitting} style={{ width: '100%', marginTop: spacing.md }}>
            {rejected ? 'Reenviar solicitud' : 'Enviar solicitud'}
          </Button>
          <TouchableOpacity onPress={logout} style={{ marginTop: spacing.lg, alignSelf: 'center' }}>
            <Text style={styles.link}>Cerrar sesión</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
      <AlertDialog visible={alert.visible} title={alert.title} description={alert.description}
        onConfirm={() => setAlert((p) => ({ ...p, visible: false }))} onClose={() => setAlert((p) => ({ ...p, visible: false }))} />
    </SafeAreaView>
  );
}

function Field({ field, value, onChange, colors, styles }: { field: KybField; value: any; onChange: (v: any) => void; colors: any; styles: any }) {
  if (field.type === 'choice') {
    return (
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>{field.label}{field.required ? ' *' : ''}</Text>
        <View style={styles.chipsRow}>
          {field.options?.map((opt) => {
            const active = value === opt;
            return (
              <TouchableOpacity key={opt} onPress={() => onChange(opt)} style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }
  const multiline = field.type === 'textarea';
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{field.label}{field.required ? ' *' : ''}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value ?? ''}
        onChangeText={onChange}
        placeholder={field.type === 'date' ? 'DD/MM/AAAA' : (field.placeholder || '')}
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        keyboardType={field.type === 'email' ? 'email-address' : field.type === 'phone' ? 'phone-pad' : field.type === 'number' ? 'numeric' : 'default'}
        autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
      />
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.lg, alignItems: 'center' },
  inner: { width: '100%', maxWidth: 640 },
  title: { fontSize: 26, fontWeight: '800', color: colors.foreground, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.mutedForeground, marginTop: 6, lineHeight: 20, marginBottom: spacing.lg },
  section: { marginBottom: spacing.xl, gap: spacing.md },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.foreground },
  sectionSub: { fontSize: 13, color: colors.mutedForeground, marginTop: -6 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.foreground },
  input: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md, paddingVertical: Platform.OS === 'ios' ? 14 : 10, fontSize: 14, color: colors.foreground,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null),
  },
  inputMultiline: { minHeight: 84, textAlignVertical: 'top' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 13, color: colors.mutedForeground, fontWeight: '500' },
  chipTextActive: { color: colors.accentForeground, fontWeight: '700' },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing.md },
  docLabel: { fontSize: 13, color: colors.foreground, fontWeight: '500' },
  docFile: { fontSize: 11, color: colors.success, marginTop: 2 },
  docBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: borderRadius.lg, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background },
  docBtnDone: { borderColor: colors.successAlpha[40] },
  docBtnText: { fontSize: 13, fontWeight: '600', color: colors.accent },
  statusWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  statusIcon: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  statusTitle: { fontSize: 22, fontWeight: '800', color: colors.foreground, textAlign: 'center' },
  statusText: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', lineHeight: 20, maxWidth: 460 },
  link: { color: colors.destructive, fontSize: 14, fontWeight: '600' },
  rejectedBanner: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.destructiveAlpha[10], borderWidth: 1, borderColor: colors.destructiveAlpha[20], borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg },
  rejectedTitle: { fontSize: 14, fontWeight: '700', color: colors.destructive },
  rejectedReason: { fontSize: 13, color: colors.foreground, marginTop: 2 },
});

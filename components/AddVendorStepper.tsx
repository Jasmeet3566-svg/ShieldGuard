import axios from 'axios';
import {
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Plus,
    RefreshCw,
    X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';

const isWeb = Platform.OS === 'web';

// ─── Constants ────────────────────────────────────────────────────────────────

const VENDOR_TYPES = ['Manufacturer', 'Distributor', 'Importer', 'Local Supplier'];

const PAYMENT_TERMS = ['Advance', '15 days', '30 days', '45 days', '60 days', 'Net 90'];

const EQUIPMENT_API = 'http://localhost:8080/api/equipment';

const REQUIRED_DOCS = [
  'GST Certificate',
  'PAN Card',
  'MSME Certificate',
  'Cancelled Cheque',
  'Vendor Declaration Form',
];

const STEP_LABELS = ['Business Info', 'Categories & Docs', 'Banking', 'Review'];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EquipmentItem {
  id: string | number;
  name: string;
  category?: string;
  decidedPrice: number;
  unit?: string;
}

export interface VendorFormData {
  vendorType: string;
  legalCompanyName: string;
  tradeName: string;
  gstin: string;
  pan: string;
  msmeNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactName: string;
  contactMobile: string;
  contactEmail: string;
  landline: string;
  selectedEquipment: EquipmentItem[];
  documents: Record<string, string>;
  bankAccount: string;
  ifscCode: string;
  beneficiaryName: string;
  paymentTerms: string;
  declaration: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: VendorFormData) => void;
}

const INITIAL_FORM: VendorFormData = {
  vendorType: '', legalCompanyName: '', tradeName: '', gstin: '', pan: '',
  msmeNumber: '', address: '', city: '', state: '', pincode: '', contactName: '', contactMobile: '',
  contactEmail: '', landline: '', selectedEquipment: [], documents: {},
  bankAccount: '', ifscCode: '', beneficiaryName: '', paymentTerms: '',
  declaration: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text style={s.fieldLabel}>
      {label}{required && <Text style={{ color: '#ef4444' }}> *</Text>}
    </Text>
  );
}

function ErrMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <Text style={s.errText}>{msg}</Text>;
}

function Field({
  label, value, onChange, placeholder, required, keyboardType, errMsg, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; keyboardType?: any; errMsg?: string; hint?: string;
}) {
  return (
    <View style={s.fieldWrap}>
      <FieldLabel label={label} required={required} />
      {hint && <Text style={s.fieldHint}>{hint}</Text>}
      <TextInput
        style={[s.input, !!errMsg && s.inputErr]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? `Enter ${label}`}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize="none"
      />
      <ErrMsg msg={errMsg} />
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={s.sectionTitle}>{title}</Text>;
}

// ─── Step 1 — Business Information ────────────────────────────────────────────

function Step1({
  form, set, errors,
}: { form: VendorFormData; set: (k: keyof VendorFormData, v: any) => void; errors: Record<string, string> }) {
  return (
    <View style={s.stepContent}>
      <SectionTitle title="Business Information" />

      <View style={s.fieldWrap}>
        <FieldLabel label="Vendor Type" required />
        <View style={s.chipRow}>
          {VENDOR_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[s.chip, form.vendorType === t && s.chipActive]}
              onPress={() => set('vendorType', t)}
              activeOpacity={0.8}
            >
              <Text style={[s.chipText, form.vendorType === t && s.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <ErrMsg msg={errors.vendorType} />
      </View>

      <Field
        label="Legal Company Name (as per GST certificate)"
        value={form.legalCompanyName}
        onChange={v => set('legalCompanyName', v)}
        required
        errMsg={errors.legalCompanyName}
      />
      <Field
        label="Trade Name / Brand Name"
        value={form.tradeName}
        onChange={v => set('tradeName', v)}
        hint="If different from legal name"
      />

      <View style={s.row2}>
        <View style={{ flex: 1 }}>
          <Field
            label="GSTIN"
            value={form.gstin}
            onChange={v => set('gstin', v.toUpperCase())}
            required
            placeholder="22AAAAA0000A1Z5"
            errMsg={errors.gstin}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label="PAN"
            value={form.pan}
            onChange={v => set('pan', v.toUpperCase())}
            required
            placeholder="AAAAA0000A"
            errMsg={errors.pan}
          />
        </View>
      </View>

      <Field
        label="MSME / Udyam Registration Number"
        value={form.msmeNumber}
        onChange={v => set('msmeNumber', v)}
        placeholder="UDYAM-XX-00-0000000 (optional)"
      />

      <Field
        label="Registered Office Address"
        value={form.address}
        onChange={v => set('address', v)}
        required
        placeholder="Street / Area"
        errMsg={errors.address}
      />
      <View style={s.row2}>
        <View style={{ flex: 1 }}>
          <Field
            label="City"
            value={form.city}
            onChange={v => set('city', v)}
            required
            placeholder="e.g. Mumbai"
            errMsg={errors.city}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label="State"
            value={form.state}
            onChange={v => set('state', v)}
            required
            placeholder="e.g. Maharashtra"
            errMsg={errors.state}
          />
        </View>
      </View>
      <Field
        label="Pincode"
        value={form.pincode}
        onChange={v => set('pincode', v)}
        keyboardType="numeric"
        placeholder="6-digit pincode"
      />

      <SectionTitle title="Contact Details" />

      <Field
        label="Contact Person Name"
        value={form.contactName}
        onChange={v => set('contactName', v)}
        required
        errMsg={errors.contactName}
      />

      <View style={s.row2}>
        <View style={{ flex: 1 }}>
          <Field
            label="Mobile"
            value={form.contactMobile}
            onChange={v => set('contactMobile', v)}
            required
            keyboardType="phone-pad"
            placeholder="+91 XXXXX XXXXX"
            errMsg={errors.contactMobile}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label="Company Landline"
            value={form.landline}
            onChange={v => set('landline', v)}
            keyboardType="phone-pad"
            placeholder="STD + Number"
          />
        </View>
      </View>

      <Field
        label="Email"
        value={form.contactEmail}
        onChange={v => set('contactEmail', v)}
        required
        keyboardType="email-address"
        placeholder="contact@company.com"
        errMsg={errors.contactEmail}
      />
    </View>
  );
}

// ─── Step 2 — Product Categories & Documents ──────────────────────────────────

function DocUploadRow({
  label, fileName, onPick,
}: { label: string; fileName?: string; onPick: () => void }) {
  return (
    <View style={s.docRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.docLabel}>{label}</Text>
        {fileName ? (
          <Text style={s.docFileName} numberOfLines={1}>{fileName}</Text>
        ) : (
          <Text style={s.docPlaceholder}>No file chosen</Text>
        )}
      </View>
      <TouchableOpacity style={s.docPickBtn} onPress={onPick} activeOpacity={0.8}>
        <Text style={s.docPickBtnText}>Choose File</Text>
      </TouchableOpacity>
    </View>
  );
}

function Step2({
  form, set, errors,
}: {
  form: VendorFormData; set: (k: keyof VendorFormData, v: any) => void;
  errors: Record<string, string>;
}) {
  const { width: vw } = useWindowDimensions();
  // Guard: ensure selectedEquipment is always an array even if state is stale
  const selectedEquipment: EquipmentItem[] = form.selectedEquipment ?? [];

  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loadingEq, setLoadingEq] = useState(true);
  const [eqError, setEqError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Custom product popup
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const [customErr, setCustomErr] = useState('');

  const openPopup = () => {
    setCustomName(''); setCustomCategory(''); setCustomPrice(''); setCustomUnit(''); setCustomErr('');
    setShowAddPopup(true);
  };

  const handleAddCustom = () => {
    if (!customName.trim()) { setCustomErr('Product name is required'); return; }
    const price = parseFloat(customPrice);
    if (!customPrice.trim() || isNaN(price) || price < 0) { setCustomErr('Enter a valid price'); return; }
    const newItem: EquipmentItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      category: customCategory.trim(),
      decidedPrice: price,
      unit: customUnit.trim(),
    };
    set('selectedEquipment', [...selectedEquipment, newItem]);
    setEquipment(prev => [...prev, newItem]);
    setShowAddPopup(false);
  };

  const fetchEquipment = async () => {
    setLoadingEq(true);
    setEqError(null);
    try {
      const token = Platform.OS === 'web'
        ? (typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null)
        : null;
      const res = await axios.get(EQUIPMENT_API, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data: any[] = Array.isArray(res.data) ? res.data : res.data?.items ?? res.data?.data ?? [];
      setEquipment(data.map(d => ({
        id: d.id ?? d._id,
        name: d.name ?? d.equipmentName ?? '',
        category: d.category ?? d.type ?? '',
        decidedPrice: Number(d.decidedPrice ?? d.price ?? d.unitPrice ?? 0),
        unit: d.unit ?? '',
      })));
    } catch {
      setEqError('Failed to load equipment list');
    } finally {
      setLoadingEq(false);
    }
  };

  useEffect(() => { fetchEquipment(); }, []);

  const isSelected = (item: EquipmentItem) =>
    selectedEquipment.some(e => e.id === item.id);

  const toggleItem = (item: EquipmentItem) => {
    if (isSelected(item)) {
      set('selectedEquipment', selectedEquipment.filter(e => e.id !== item.id));
    } else {
      set('selectedEquipment', [...selectedEquipment, item]);
    }
  };

  const toggleAll = () => {
    const filtered = filteredEq;
    const allSelected = filtered.every(isSelected);
    if (allSelected) {
      set('selectedEquipment', selectedEquipment.filter(e => !filtered.some(f => f.id === e.id)));
    } else {
      const toAdd = filtered.filter(f => !isSelected(f));
      set('selectedEquipment', [...selectedEquipment, ...toAdd]);
    }
  };

  const filteredEq = equipment.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.category ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handlePick = (docName: string) => {
    if (isWeb) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.jpg,.jpeg,.png';
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) set('documents', { ...form.documents, [docName]: file.name });
      };
      input.click();
    }
  };

  const allFilteredSelected = filteredEq.length > 0 && filteredEq.every(isSelected);

  return (
    <View style={s.stepContent}>
      {/* Section title row with + button */}
      <View style={s.eqTitleRow}>
        <Text style={s.sectionTitle}>Product Categories & Equipment</Text>
        <TouchableOpacity style={s.eqAddBtn} onPress={openPopup} activeOpacity={0.8}>
          <Plus size={14} color="#fff" />
          <Text style={s.eqAddBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.fieldHint}>
        Select from the list below, or click "+ Add" to add a custom product with its decided price.
      </Text>

      {/* Custom product popup */}
      <Modal visible={showAddPopup} transparent animationType="fade" onRequestClose={() => setShowAddPopup(false)}>
        <View style={s.popupOverlay}>
          <View style={[s.popupSheet, !isWeb && { width: vw - 40 }]}>
            <View style={s.popupHeader}>
              <Text style={s.popupTitle}>Add Custom Product</Text>
              <TouchableOpacity onPress={() => setShowAddPopup(false)} style={s.closeBtn} hitSlop={8}>
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={s.popupBody}>
              <View style={s.fieldWrap}>
                <FieldLabel label="Product / Equipment Name" required />
                <TextInput
                  style={[s.input, !!customErr && customErr.includes('name') && s.inputErr]}
                  value={customName}
                  onChangeText={v => { setCustomName(v); setCustomErr(''); }}
                  placeholder="e.g. Metal Detector MD-2000"
                  placeholderTextColor="#94a3b8"
                  autoFocus
                />
              </View>

              <View style={s.fieldWrap}>
                <FieldLabel label="Category" />
                <TextInput
                  style={s.input}
                  value={customCategory}
                  onChangeText={setCustomCategory}
                  placeholder="e.g. Security Equipment"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={s.row2}>
                <View style={{ flex: 1.5 }}>
                  <FieldLabel label="Decided Price (₹)" required />
                  <TextInput
                    style={[s.input, !!customErr && customErr.includes('price') && s.inputErr]}
                    value={customPrice}
                    onChangeText={v => { setCustomPrice(v); setCustomErr(''); }}
                    placeholder="0.00"
                    placeholderTextColor="#94a3b8"
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FieldLabel label="Unit" />
                  <TextInput
                    style={s.input}
                    value={customUnit}
                    onChangeText={setCustomUnit}
                    placeholder="pcs / set"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              {!!customErr && <Text style={s.errText}>{customErr}</Text>}
            </View>

            <View style={s.popupFooter}>
              <TouchableOpacity style={s.backBtn} onPress={() => setShowAddPopup(false)} activeOpacity={0.8}>
                <Text style={s.backBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.nextBtn} onPress={handleAddCustom} activeOpacity={0.85}>
                <Plus size={14} color="#fff" />
                <Text style={s.nextBtnText}>Add to List</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Search bar */}
      <View style={s.eqSearchWrap}>
        <TextInput
          style={s.eqSearchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search equipment or category…"
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity onPress={fetchEquipment} style={s.eqRefreshBtn} activeOpacity={0.8}>
          <RefreshCw size={15} color="#7c3aed" />
        </TouchableOpacity>
      </View>

      {/* Table */}
      <View style={s.eqTable}>
        {/* Table header */}
        <View style={[s.eqRow, s.eqHeaderRow]}>
          <TouchableOpacity style={s.eqCheckCell} onPress={toggleAll} activeOpacity={0.8}>
            <View style={[s.eqCheckbox, allFilteredSelected && s.eqCheckboxChecked]}>
              {allFilteredSelected && <CheckCircle size={12} color="#fff" />}
            </View>
          </TouchableOpacity>
          <Text style={[s.eqCell, s.eqHeaderCell, { flex: 3 }]}>Equipment / Product</Text>
          <Text style={[s.eqCell, s.eqHeaderCell, { flex: 2 }]}>Category</Text>
          <Text style={[s.eqCell, s.eqHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Decided Price</Text>
        </View>

        {loadingEq ? (
          <View style={s.eqCenter}>
            <ActivityIndicator color="#7c3aed" />
            <Text style={s.eqStatusText}>Loading equipment…</Text>
          </View>
        ) : (
          <>
            {/* Non-blocking error banner — still shows any items in the table */}
            {eqError && (
              <View style={s.eqErrorBanner}>
                <Text style={s.eqErrorBannerText}>{eqError}</Text>
                <TouchableOpacity onPress={fetchEquipment} style={s.eqRetryBannerBtn} activeOpacity={0.8}>
                  <Text style={s.eqRetryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
            {filteredEq.length === 0 ? (
              <View style={s.eqCenter}>
                <Text style={s.eqStatusText}>No equipment found. Use "+ Add" to add manually.</Text>
              </View>
            ) : (
              filteredEq.map((item, idx) => (
                <TouchableOpacity
                  key={String(item.id)}
                  style={[s.eqRow, idx % 2 === 1 && s.eqRowAlt, isSelected(item) && s.eqRowSelected]}
                  onPress={() => toggleItem(item)}
                  activeOpacity={0.8}
                >
                  <View style={s.eqCheckCell}>
                    <View style={[s.eqCheckbox, isSelected(item) && s.eqCheckboxChecked]}>
                      {isSelected(item) && <CheckCircle size={12} color="#fff" />}
                    </View>
                  </View>
                  <Text style={[s.eqCell, { flex: 3 }]} numberOfLines={2}>{item.name}</Text>
                  <Text style={[s.eqCell, s.eqCategoryCell, { flex: 2 }]} numberOfLines={1}>
                    {item.category || '—'}
                  </Text>
                  <Text style={[s.eqCell, s.eqPriceCell, { flex: 1.5 }]} numberOfLines={1}>
                    ₹{item.decidedPrice.toLocaleString('en-IN')}
                    {item.unit ? `/${item.unit}` : ''}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </View>

      {selectedEquipment.length > 0 && (
        <Text style={s.eqSelectedCount}>
          {selectedEquipment.length} item{selectedEquipment.length > 1 ? 's' : ''} selected
        </Text>
      )}
      <ErrMsg msg={errors.selectedEquipment} />

      <SectionTitle title="Documents" />
      <Text style={s.fieldHint}>Upload scanned copies or clear photos (PDF / JPG / PNG).</Text>

      <View style={s.docList}>
        {REQUIRED_DOCS.map(doc => (
          <DocUploadRow
            key={doc}
            label={doc}
            fileName={form.documents[doc]}
            onPick={() => handlePick(doc)}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Step 3 — Banking & Payment Terms ─────────────────────────────────────────

function Step3({
  form, set, errors,
}: { form: VendorFormData; set: (k: keyof VendorFormData, v: any) => void; errors: Record<string, string> }) {
  return (
    <View style={s.stepContent}>
      <SectionTitle title="Bank Account Details" />

      <Field
        label="Bank Account Number"
        value={form.bankAccount}
        onChange={v => set('bankAccount', v)}
        required
        keyboardType="numeric"
        errMsg={errors.bankAccount}
      />
      <View style={s.row2}>
        <View style={{ flex: 1 }}>
          <Field
            label="IFSC Code"
            value={form.ifscCode}
            onChange={v => set('ifscCode', v.toUpperCase())}
            required
            placeholder="SBIN0000001"
            errMsg={errors.ifscCode}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label="Beneficiary Name"
            value={form.beneficiaryName}
            onChange={v => set('beneficiaryName', v)}
            required
            hint="As per bank records"
            errMsg={errors.beneficiaryName}
          />
        </View>
      </View>

      <SectionTitle title="Payment Terms" />

      <View style={s.fieldWrap}>
        <FieldLabel label="Default Payment Terms" required />
        <View style={s.chipRow}>
          {PAYMENT_TERMS.map(t => (
            <TouchableOpacity
              key={t}
              style={[s.chip, form.paymentTerms === t && s.chipActive]}
              onPress={() => set('paymentTerms', t)}
              activeOpacity={0.8}
            >
              <Text style={[s.chipText, form.paymentTerms === t && s.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <ErrMsg msg={errors.paymentTerms} />
      </View>
    </View>
  );
}

// ─── Step 4 — Review & Submit ─────────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={s.reviewRow}>
      <Text style={s.reviewLabel}>{label}</Text>
      <Text style={s.reviewValue}>{value}</Text>
    </View>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.reviewSection}>
      <Text style={s.reviewSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Step4({
  form, set, errors,
}: { form: VendorFormData; set: (k: keyof VendorFormData, v: any) => void; errors: Record<string, string> }) {
  return (
    <View style={s.stepContent}>
      <SectionTitle title="Review Your Information" />
      <Text style={s.fieldHint}>Please verify all details before submitting for approval.</Text>

      <ReviewSection title="Business Information">
        <ReviewRow label="Vendor Type" value={form.vendorType} />
        <ReviewRow label="Legal Company Name" value={form.legalCompanyName} />
        <ReviewRow label="Trade Name" value={form.tradeName} />
        <ReviewRow label="GSTIN" value={form.gstin} />
        <ReviewRow label="PAN" value={form.pan} />
        <ReviewRow label="MSME Number" value={form.msmeNumber} />
        <ReviewRow label="Address" value={[form.address, form.city, form.state].filter(Boolean).join(', ') + (form.pincode ? ` — ${form.pincode}` : '')} />
      </ReviewSection>

      <ReviewSection title="Contact Details">
        <ReviewRow label="Contact Person" value={form.contactName} />
        <ReviewRow label="Mobile" value={form.contactMobile} />
        <ReviewRow label="Email" value={form.contactEmail} />
        <ReviewRow label="Landline" value={form.landline} />
      </ReviewSection>

      <ReviewSection title="Selected Equipment">
        {(form.selectedEquipment ?? []).length === 0 ? (
          <Text style={s.reviewNoDoc}>No equipment selected</Text>
        ) : (
          (form.selectedEquipment ?? []).map(e => (
            <ReviewRow
              key={String(e.id)}
              label={e.name + (e.category ? ` (${e.category})` : '')}
              value={`₹${Number(e.decidedPrice).toLocaleString('en-IN')}${e.unit ? `/${e.unit}` : ''}`}
            />
          ))
        )}
      </ReviewSection>

      <ReviewSection title="Documents Uploaded">
        {Object.entries(form.documents).length > 0 ? (
          Object.entries(form.documents).map(([doc, name]) => (
            <ReviewRow key={doc} label={doc} value={name} />
          ))
        ) : (
          <Text style={s.reviewNoDoc}>No documents uploaded</Text>
        )}
      </ReviewSection>

      <ReviewSection title="Banking & Payment">
        <ReviewRow label="Account Number" value={form.bankAccount} />
        <ReviewRow label="IFSC Code" value={form.ifscCode} />
        <ReviewRow label="Beneficiary Name" value={form.beneficiaryName} />
        <ReviewRow label="Payment Terms" value={form.paymentTerms} />
      </ReviewSection>

      {/* Declaration */}
      <View style={s.declarationBox}>
        <TouchableOpacity
          style={s.checkboxRow}
          onPress={() => set('declaration', !form.declaration)}
          activeOpacity={0.8}
        >
          <View style={[s.checkbox, form.declaration && s.checkboxChecked]}>
            {form.declaration && <CheckCircle size={14} color="#fff" />}
          </View>
          <Text style={s.declarationText}>
            I hereby declare that the information provided above is true and accurate to the best of
            my knowledge. I accept the vendor onboarding terms and conditions.
          </Text>
        </TouchableOpacity>
        <ErrMsg msg={errors.declaration} />
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AddVendorStepper({ visible, onClose, onSubmit }: Props) {
  const { width: vw } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<VendorFormData>({ ...INITIAL_FORM, documents: {}, selectedEquipment: [] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const PAYMENT_TERMS_MAP: Record<string, string> = {
    'Advance': 'ADVANCE',
    '15 days': '15_DAYS',
    '30 days': '30_DAYS',
    '45 days': '45_DAYS',
    '60 days': '60_DAYS',
    'Net 90': 'NET_90',
  };

  const set = (key: keyof VendorFormData, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.vendorType) e.vendorType = 'Please select a vendor type';
      if (!form.legalCompanyName.trim()) e.legalCompanyName = 'Required';
      if (!form.gstin.trim()) e.gstin = 'Required';
      if (!form.pan.trim()) e.pan = 'Required';
      if (!form.address.trim()) e.address = 'Required';
      if (!form.city.trim()) e.city = 'Required';
      if (!form.state.trim()) e.state = 'Required';
      if (!form.contactName.trim()) e.contactName = 'Required';
      if (!form.contactMobile.trim()) e.contactMobile = 'Required';
      if (!form.contactEmail.trim()) e.contactEmail = 'Required';
    }
    if (step === 1) {
      if ((form.selectedEquipment ?? []).length === 0)
        e.selectedEquipment = 'Select at least one equipment item';
    }
    if (step === 2) {
      if (!form.bankAccount.trim()) e.bankAccount = 'Required';
      if (!form.ifscCode.trim()) e.ifscCode = 'Required';
      if (!form.beneficiaryName.trim()) e.beneficiaryName = 'Required';
      if (!form.paymentTerms) e.paymentTerms = 'Please select a payment term';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const back = () => { setErrors({}); setStep(s => s - 1); };

  const handleClose = () => {
    setStep(0);
    setForm({ ...INITIAL_FORM, documents: {}, selectedEquipment: [] });
    setErrors({});
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.declaration) {
      setErrors({ declaration: 'You must accept the declaration to submit' });
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const token = Platform.OS === 'web'
        ? (typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null)
        : null;

      const body = {
        vendorType: form.vendorType.toUpperCase().replace(/ /g, '_'),
        legalCompanyName: form.legalCompanyName,
        tradeName: form.tradeName,
        gstin: form.gstin,
        pan: form.pan,
        msmeNumber: form.msmeNumber || undefined,
        registeredAddress: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        contactPersonName: form.contactName,
        contactPersonMobile: form.contactMobile,
        contactPersonEmail: form.contactEmail,
        companyLandline: form.landline || undefined,
        bankAccountNumber: form.bankAccount,
        ifscCode: form.ifscCode,
        beneficiaryName: form.beneficiaryName,
        paymentTerms: PAYMENT_TERMS_MAP[form.paymentTerms] ?? form.paymentTerms.toUpperCase().replace(/ /g, '_'),
        declarationAccepted: true,
        products: (form.selectedEquipment ?? []).map(e => ({
          productName: e.name,
          productCategory: (e.category ?? '').toUpperCase().replace(/ /g, '_') || 'OTHER',
          description: '',
          unitPrice: e.decidedPrice,
          unit: (e.unit ?? 'PCS').toUpperCase(),
        })),
      };

      await axios.post('http://localhost:8080/api/vendors', body, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      onSubmit(form);
      handleClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? err?.message ?? 'Failed to submit. Please try again.';
      setSubmitError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={[s.sheet, !isWeb && { width: vw - 24 }]}>

          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.headerTitle}>Add Vendor</Text>
              <Text style={s.headerSub}>Step {step + 1} of 4 — {STEP_LABELS[step]}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={s.closeBtn} hitSlop={8}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Step Indicator */}
          <View style={s.stepBar}>
            {STEP_LABELS.map((label, i) => (
              <React.Fragment key={i}>
                <View style={s.stepItem}>
                  <View style={[s.stepDot, i < step && s.stepDotDone, i === step && s.stepDotActive]}>
                    {i < step
                      ? <CheckCircle size={12} color="#fff" />
                      : <Text style={[s.stepDotNum, i === step && { color: '#fff' }]}>{i + 1}</Text>}
                  </View>
                  <Text style={[s.stepLabel, i === step && s.stepLabelActive]} numberOfLines={1}>
                    {label}
                  </Text>
                </View>
                {i < STEP_LABELS.length - 1 && (
                  <View style={[s.stepLine, i < step && s.stepLineDone]} />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* Body */}
          <ScrollView
            style={s.body}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {step === 0 && <Step1 form={form} set={set} errors={errors} />}
            {step === 1 && <Step2 form={form} set={set} errors={errors} />}
            {step === 2 && <Step3 form={form} set={set} errors={errors} />}
            {step === 3 && <Step4 form={form} set={set} errors={errors} />}
          </ScrollView>

          {/* Footer */}
          <View style={s.footer}>
            {step > 0 && (
              <TouchableOpacity style={s.backBtn} onPress={back} activeOpacity={0.8} disabled={submitting}>
                <ChevronLeft size={16} color="#475569" />
                <Text style={s.backBtnText}>Back</Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              {submitError ? (
                <Text style={s.submitErrText} numberOfLines={2}>{submitError}</Text>
              ) : null}
            </View>
            {step < 3 ? (
              <TouchableOpacity style={s.nextBtn} onPress={next} activeOpacity={0.85}>
                <Text style={s.nextBtnText}>Continue</Text>
                <ChevronRight size={16} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[s.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={submitting}
              >
                {submitting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <CheckCircle size={16} color="#fff" />}
                <Text style={s.submitBtnText}>{submitting ? 'Submitting…' : 'Submit for Approval'}</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const SHEET_WIDTH = isWeb ? 680 : 375;

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    width: SHEET_WIDTH,
    maxHeight: isWeb ? '90vh' as any : '92%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  headerSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Step indicator
  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: '#7c3aed' },
  stepDotDone: { backgroundColor: '#10b981' },
  stepDotNum: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  stepLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  stepLabelActive: { color: '#7c3aed' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#e2e8f0', marginHorizontal: 4, marginBottom: 14 },
  stepLineDone: { backgroundColor: '#10b981' },

  // Body
  body: { flex: 1, paddingHorizontal: 24 },
  stepContent: { paddingTop: 20 },

  // Section title
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7c3aed',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 12,
  },

  // Fields
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  fieldHint: { fontSize: 11, color: '#94a3b8', marginBottom: 6, marginTop: -4 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: isWeb ? 10 : 12,
    fontSize: 14,
    color: '#1e293b',
    backgroundColor: '#fafafa',
  },
  inputErr: { borderColor: '#ef4444' },
  errText: { fontSize: 11, color: '#ef4444', marginTop: 4 },
  row2: { flexDirection: 'row', gap: 12 },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    marginBottom: 4,
  },
  chipActive: { backgroundColor: '#ede9fe', borderColor: '#7c3aed' },
  chipText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  chipTextActive: { color: '#6d28d9', fontWeight: '700' },

  // Documents
  docList: { gap: 4, marginTop: 4 },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
    marginBottom: 8,
  },
  docLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  docFileName: { fontSize: 11, color: '#10b981', marginTop: 2, fontWeight: '500' },
  docPlaceholder: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  docPickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  docPickBtnText: { fontSize: 12, color: '#7c3aed', fontWeight: '700' },

  // Equipment table
  eqSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    marginBottom: 10,
    overflow: 'hidden',
  },
  eqSearchInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: isWeb ? 9 : 11,
    fontSize: 13,
    color: '#1e293b',
  },
  eqRefreshBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eqTable: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 6,
  },
  eqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingRight: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  eqHeaderRow: {
    backgroundColor: '#f8fafc',
    paddingVertical: 9,
  },
  eqRowAlt: { backgroundColor: '#fafafa' },
  eqRowSelected: { backgroundColor: '#faf5ff' },
  eqCheckCell: {
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eqCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eqCheckboxChecked: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  eqCell: { fontSize: 13, color: '#374151' },
  eqHeaderCell: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  eqCategoryCell: { fontSize: 12, color: '#64748b' },
  eqPriceCell: { fontSize: 13, fontWeight: '700', color: '#10b981', textAlign: 'right' },
  eqCenter: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  eqStatusText: { fontSize: 13, color: '#94a3b8' },
  eqErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fef2f2',
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
    gap: 8,
  },
  eqErrorBannerText: { flex: 1, fontSize: 12, color: '#ef4444', fontWeight: '500' },
  eqRetryBannerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: '#fff',
  },
  eqRetryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  eqRetryText: { fontSize: 12, color: '#7c3aed', fontWeight: '700' },
  eqSelectedCount: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 2,
  },

  // Equipment section title row
  eqTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 4,
  },
  eqAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
  },
  eqAddBtnText: { fontSize: 12, color: '#fff', fontWeight: '700' },

  // Custom product popup
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupSheet: {
    width: isWeb ? 460 : 340,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 16,
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  popupTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  popupBody: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  popupFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },

  // Review
  reviewSection: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    marginBottom: 14,
  },
  reviewSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    gap: 12,
  },
  reviewLabel: { fontSize: 13, color: '#64748b', fontWeight: '500', flex: 1 },
  reviewValue: { fontSize: 13, color: '#1e293b', fontWeight: '600', flex: 2, textAlign: 'right' },
  reviewNoDoc: { fontSize: 13, color: '#94a3b8', paddingHorizontal: 16, paddingVertical: 10 },

  // Declaration
  declarationBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fafafa',
    padding: 16,
    marginBottom: 8,
    marginTop: 4,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  declarationText: { flex: 1, fontSize: 13, color: '#475569', lineHeight: 20 },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fff',
    gap: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
    backgroundColor: '#f8fafc',
  },
  backBtnText: { fontSize: 14, color: '#475569', fontWeight: '600' },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#7c3aed',
    gap: 6,
  },
  nextBtnText: { fontSize: 14, color: '#fff', fontWeight: '700' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#10b981',
    gap: 8,
  },
  submitBtnText: { fontSize: 14, color: '#fff', fontWeight: '700' },
  submitErrText: { fontSize: 11, color: '#ef4444', fontWeight: '500', flexShrink: 1 },
});

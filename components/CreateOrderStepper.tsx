import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ChevronDown, Package, Plus, X, XCircle } from 'lucide-react-native';
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface VendorProduct {
  id: string;
  productName: string;
  productCategory: string;
  description: string;
  unitPrice: number;
  unit: string;
}

interface Vendor {
  id: string;
  legalCompanyName: string;
  tradeName?: string;
  contactPersonEmail?: string;
  contactPersonMobile?: string;
  products: VendorProduct[];
}

interface OrderItem {
  /** unique key per row (productId + timestamp) */
  rowId: string;
  vendorId: string;
  vendorName: string;
  productId: string;
  productName: string;
  productCategory: string;
  unit: string;
  unitPrice: number;
  quantity: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToken = async () =>
  Platform.OS === 'web'
    ? localStorage.getItem('accessToken')
    : AsyncStorage.getItem('accessToken');

const fmt = (n: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateOrderStepper({ visible, onClose }: Props) {
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Vendors
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);

  // Add-item popup
  const [addPopupVisible, setAddPopupVisible] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({}); // productId → qty
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  // Notifications per vendor
  const [vendorNotifications, setVendorNotifications] = useState<
    Record<string, { email: boolean; whatsapp: boolean }>
  >({});

  const toggleNotification = (vendorId: string, channel: 'email' | 'whatsapp') =>
    setVendorNotifications(prev => ({
      ...prev,
      [vendorId]: {
        email: prev[vendorId]?.email ?? false,
        whatsapp: prev[vendorId]?.whatsapp ?? false,
        [channel]: !(prev[vendorId]?.[channel] ?? false),
      },
    }));

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Fetch vendors when modal opens ──
  useEffect(() => {
    if (visible) fetchVendors();
  }, [visible]);

  const fetchVendors = async () => {
    setVendorsLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get('http://localhost:8080/api/vendors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(Array.isArray(res.data) ? res.data : []);
    } catch {
      // silently ignore; user will see empty dropdown
    } finally {
      setVendorsLoading(false);
    }
  };

  const selectedVendor = vendors.find(v => v.id === selectedVendorId);
  const grandTotal = orderItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  // ── Add-item popup helpers ──
  const openAddPopup = () => {
    setSelectedVendorId('');
    setSelectedProducts({});
    setVendorDropdownOpen(false);
    setProductDropdownOpen(false);
    setAddPopupVisible(true);
  };

  const toggleProduct = (p: VendorProduct) => {
    setSelectedProducts(prev => {
      if (prev[p.id]) {
        const next = { ...prev };
        delete next[p.id];
        return next;
      }
      return { ...prev, [p.id]: 1 };
    });
  };

  const setQty = (productId: string, qty: number) => {
    if (qty < 1) return;
    setSelectedProducts(prev => ({ ...prev, [productId]: qty }));
  };

  const handleAddItems = () => {
    if (!selectedVendor) return;
    const newItems: OrderItem[] = Object.entries(selectedProducts).map(([productId, qty]) => {
      const p = selectedVendor.products.find(pr => pr.id === productId)!;
      return {
        rowId: `${productId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        vendorId: selectedVendorId,
        vendorName: selectedVendor.legalCompanyName,
        productId,
        productName: p.productName,
        productCategory: p.productCategory,
        unit: p.unit,
        unitPrice: p.unitPrice,
        quantity: qty,
      };
    });
    setOrderItems(prev => [...prev, ...newItems]);
    setAddPopupVisible(false);
  };

  const removeItem = (rowId: string) =>
    setOrderItems(prev => prev.filter(i => i.rowId !== rowId));

  const bumpQty = (rowId: string, delta: number) =>
    setOrderItems(prev =>
      prev.map(i => i.rowId === rowId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
    );

  // ── Reset & close ──
  const handleClose = () => {
    setStep(0);
    setOrderItems([]);
    setAddPopupVisible(false);
    setSubmitError(null);
    setVendorNotifications({});
    onClose();
  };

  // ── Place order ──
  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const token = await getToken();
      const headers: Record<string, string> = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

      // Group items by vendorId and post one order per vendor
      const vendorIds = [...new Set(orderItems.map(i => i.vendorId))];
      await Promise.all(
        vendorIds.map(vendorId => {
          const vendor = vendors.find(v => v.id === vendorId);
          const items = orderItems.filter(i => i.vendorId === vendorId);
          const vendorTotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
          const notifPrefs = vendorNotifications[vendorId];

          const notifications: { email?: string; whatsapp?: string } = {};
          if (notifPrefs?.email && vendor?.contactPersonEmail) {
            notifications.email = vendor.contactPersonEmail;
          }
          if (notifPrefs?.whatsapp && vendor?.contactPersonMobile) {
            notifications.whatsapp = vendor.contactPersonMobile;
          }

          const body: any = {
            vendorId,
            grandTotal: vendorTotal,
            items: items.map(i => ({
              productId: i.productId,
              productName: i.productName,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              totalPrice: i.unitPrice * i.quantity,
            })),
          };
          if (Object.keys(notifications).length > 0) {
            body.notifications = notifications;
          }

          return axios.post('http://localhost:8080/api/orders', body, { headers });
        })
      );
      handleClose();
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message ?? err?.message ?? 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  // ── Render ──
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={[s.modal, { width: isWeb ? 820 : width - 16 }]}>

          {/* ── Header ── */}
          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{step === 0 ? 'New Order — Items' : 'New Order — Review'}</Text>
              <Text style={s.subtitle}>
                {step === 0 ? 'Add items from one or more vendors' : 'Confirm items before placing the order'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={{ padding: 4 }}>
              <XCircle size={26} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* ── Step indicator ── */}
          <View style={s.stepBar}>
            {['Items', 'Review & Place'].map((label, i) => (
              <React.Fragment key={label}>
                <View style={s.stepItem}>
                  <View style={[s.stepDot, i <= step && s.stepDotActive]}>
                    <Text style={[s.stepDotText, i <= step && s.stepDotTextActive]}>{i + 1}</Text>
                  </View>
                  <Text style={[s.stepLabel, i <= step && s.stepLabelActive]}>{label}</Text>
                </View>
                {i < 1 && <View style={[s.stepLine, i < step && s.stepLineActive]} />}
              </React.Fragment>
            ))}
          </View>

          {/* ── Body ── */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
            {step === 0 ? (
              <View style={{ padding: 20 }}>
                {/* Table header bar */}
                <View style={s.tableTopRow}>
                  <Text style={s.tableTitle}>Items</Text>
                  <TouchableOpacity style={s.addBtn} onPress={openAddPopup} activeOpacity={0.85}>
                    <Plus size={14} color="#fff" />
                    <Text style={s.addBtnText}>Add Item</Text>
                  </TouchableOpacity>
                </View>

                {orderItems.length === 0 ? (
                  <View style={s.emptyBox}>
                    <Package size={34} color="#cbd5e1" />
                    <Text style={s.emptyText}>No items yet. Tap + Add Item to begin.</Text>
                  </View>
                ) : (
                  <View style={s.table}>
                    {/* Table col headers */}
                    <View style={s.tableHeaderRow}>
                      <Text style={[s.th, { flex: 2 }]}>Product</Text>
                      <Text style={[s.th, { flex: 1.4 }]}>Vendor</Text>
                      <Text style={[s.th, { width: 60 }]}>Unit</Text>
                      <Text style={[s.th, { width: 80 }]}>Unit Price</Text>
                      <Text style={[s.th, { width: 110 }]}>Qty</Text>
                      <Text style={[s.th, { width: 90, textAlign: 'right' }]}>Total</Text>
                      <Text style={{ width: 30 }} />
                    </View>

                    {orderItems.map((item, idx) => (
                      <View key={item.rowId} style={[s.tr, idx % 2 === 1 && s.trAlt]}>
                        <View style={{ flex: 2 }}>
                          <Text style={s.tdBold} numberOfLines={1}>{item.productName}</Text>
                          <Text style={s.tdSub}>{item.productCategory}</Text>
                        </View>
                        <Text style={[s.td, { flex: 1.4 }]} numberOfLines={1}>{item.vendorName}</Text>
                        <Text style={[s.td, { width: 60 }]}>{item.unit}</Text>
                        <Text style={[s.td, { width: 80 }]}>₹{item.unitPrice.toLocaleString()}</Text>
                        <View style={[s.qtyRow, { width: 110 }]}>
                          <TouchableOpacity style={s.qtyBtn} onPress={() => bumpQty(item.rowId, -1)}>
                            <Text style={s.qtyBtnText}>−</Text>
                          </TouchableOpacity>
                          <Text style={s.qtyVal}>{item.quantity}</Text>
                          <TouchableOpacity style={s.qtyBtn} onPress={() => bumpQty(item.rowId, 1)}>
                            <Text style={s.qtyBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={[s.td, { width: 90, textAlign: 'right', fontWeight: '700', color: '#10b981' }]}>
                          ₹{fmt(item.unitPrice * item.quantity)}
                        </Text>
                        <TouchableOpacity style={{ width: 30, alignItems: 'center' }} onPress={() => removeItem(item.rowId)}>
                          <X size={14} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}

                    {/* Grand total row */}
                    <View style={s.totalRow}>
                      <Text style={s.totalLabel}>Grand Total</Text>
                      <Text style={s.totalValue}>₹{fmt(grandTotal)}</Text>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              /* ── Step 2: Review ── */
              <View style={{ padding: 20 }}>
                <Text style={s.reviewHeading}>Order Summary</Text>
                <View style={s.table}>
                  <View style={s.tableHeaderRow}>
                    <Text style={[s.th, { flex: 2 }]}>Product</Text>
                    <Text style={[s.th, { flex: 1.4 }]}>Vendor</Text>
                    <Text style={[s.th, { width: 80 }]}>Qty</Text>
                    <Text style={[s.th, { width: 90 }]}>Unit Price</Text>
                    <Text style={[s.th, { width: 100, textAlign: 'right' }]}>Total</Text>
                  </View>
                  {orderItems.map((item, idx) => (
                    <View key={item.rowId} style={[s.tr, idx % 2 === 1 && s.trAlt]}>
                      <View style={{ flex: 2 }}>
                        <Text style={s.tdBold} numberOfLines={1}>{item.productName}</Text>
                        <Text style={s.tdSub}>{item.productCategory}</Text>
                      </View>
                      <Text style={[s.td, { flex: 1.4 }]} numberOfLines={1}>{item.vendorName}</Text>
                      <Text style={[s.td, { width: 80 }]}>{item.quantity} {item.unit}</Text>
                      <Text style={[s.td, { width: 90 }]}>₹{item.unitPrice.toLocaleString()}</Text>
                      <Text style={[s.td, { width: 100, textAlign: 'right', fontWeight: '700', color: '#10b981' }]}>
                        ₹{fmt(item.unitPrice * item.quantity)}
                      </Text>
                    </View>
                  ))}
                  <View style={s.totalRow}>
                    <Text style={s.totalLabel}>Grand Total</Text>
                    <Text style={s.totalValue}>₹{fmt(grandTotal)}</Text>
                  </View>
                </View>

                {/* Vendors involved */}
                <Text style={[s.reviewHeading, { marginTop: 20 }]}>Vendors Involved</Text>
                <View style={{ gap: 8 }}>
                  {[...new Set(orderItems.map(i => i.vendorName))].map(vendorName => (
                    <View key={vendorName} style={s.vendorChip}>
                      <Text style={s.vendorChipName}>{vendorName}</Text>
                      <Text style={s.vendorChipCount}>
                        {orderItems.filter(i => i.vendorName === vendorName).length} item(s) · ₹{fmt(
                          orderItems.filter(i => i.vendorName === vendorName).reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
                        )}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* ── Notification preferences per vendor ── */}
                <Text style={[s.reviewHeading, { marginTop: 20 }]}>Notifications</Text>
                <View style={{ gap: 8 }}>
                  {[...new Set(orderItems.map(i => i.vendorId))].map(vendorId => {
                    const vendor = vendors.find(v => v.id === vendorId);
                    const notifPrefs = vendorNotifications[vendorId];
                    return (
                      <View key={vendorId} style={s.notifCard}>
                        <Text style={s.notifVendorName}>
                          {vendor?.legalCompanyName ?? vendorId}
                        </Text>
                        {/* Email checkbox */}
                        <TouchableOpacity
                          style={s.notifRow}
                          onPress={() => toggleNotification(vendorId, 'email')}
                          activeOpacity={0.8}>
                          <View style={[s.checkbox, notifPrefs?.email && s.checkboxActive]}>
                            {notifPrefs?.email && <Text style={s.checkmark}>✓</Text>}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={s.notifLabel}>Email</Text>
                            <Text style={s.notifValue} numberOfLines={1}>
                              {vendor?.contactPersonEmail ?? 'Not available'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                        {/* WhatsApp checkbox */}
                        <TouchableOpacity
                          style={s.notifRow}
                          onPress={() => toggleNotification(vendorId, 'whatsapp')}
                          activeOpacity={0.8}>
                          <View style={[s.checkbox, notifPrefs?.whatsapp && s.checkboxActive]}>
                            {notifPrefs?.whatsapp && <Text style={s.checkmark}>✓</Text>}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={s.notifLabel}>WhatsApp</Text>
                            <Text style={s.notifValue} numberOfLines={1}>
                              {vendor?.contactPersonMobile ?? 'Not available'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>

                {submitError && (
                  <View style={s.errorBanner}>
                    <Text style={s.errorBannerText}>{submitError}</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* ── Footer ── */}
          <View style={s.footer}>
            {step === 0 ? (
              <>
                <TouchableOpacity style={s.cancelBtn} onPress={handleClose}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.primaryBtn, orderItems.length === 0 && s.primaryBtnDisabled]}
                  onPress={() => setStep(1)}
                  disabled={orderItems.length === 0}
                  activeOpacity={0.85}>
                  <Text style={s.primaryBtnText}>Review Order →</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setStep(0)}>
                  <Text style={s.cancelBtnText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.placeBtn, submitting && s.primaryBtnDisabled]}
                  onPress={handlePlaceOrder}
                  disabled={submitting}
                  activeOpacity={0.85}>
                  {submitting
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={s.placeBtnText}>Place Order</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      {/* ══ Add Item Popup ══ */}
      <Modal
        visible={addPopupVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddPopupVisible(false)}>
        <View style={s.popupOverlay}>
          <View style={[s.popup, { width: isWeb ? 520 : width - 24 }]}>
            {/* Popup header */}
            <View style={s.popupHeader}>
              <Text style={s.popupTitle}>Add Items from Vendor</Text>
              <TouchableOpacity onPress={() => setAddPopupVisible(false)}>
                <XCircle size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: isWeb ? 480 : 360 }}
              contentContainerStyle={{ padding: 20, gap: 18 }}
              nestedScrollEnabled>

              {/* ── Vendor dropdown ── */}
              <View>
                <Text style={s.fieldLabel}>Vendor <Text style={s.required}>*</Text></Text>
                {vendorsLoading ? (
                  <ActivityIndicator color="#6366f1" style={{ marginTop: 8 }} />
                ) : (
                  <TouchableOpacity
                    style={s.dropdownTrigger}
                    onPress={() => { setVendorDropdownOpen(v => !v); setProductDropdownOpen(false); }}
                    activeOpacity={0.85}>
                    <Text style={selectedVendorId ? s.dropdownValue : s.dropdownPlaceholder}>
                      {selectedVendor?.legalCompanyName ?? 'Select vendor…'}
                    </Text>
                    <ChevronDown size={16} color="#94a3b8" />
                  </TouchableOpacity>
                )}
                {vendorDropdownOpen && (
                  <View style={s.dropdownList}>
                    <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
                      {vendors.length === 0 ? (
                        <Text style={s.dropdownEmpty}>No vendors found</Text>
                      ) : vendors.map(v => (
                        <TouchableOpacity
                          key={v.id}
                          style={[s.dropdownItem, v.id === selectedVendorId && s.dropdownItemActive]}
                          onPress={() => {
                            setSelectedVendorId(v.id);
                            setSelectedProducts({});
                            setVendorDropdownOpen(false);
                          }}>
                          <Text style={[s.dropdownItemText, v.id === selectedVendorId && s.dropdownItemTextActive]}>
                            {v.legalCompanyName}
                          </Text>
                          {v.tradeName ? (
                            <Text style={s.dropdownItemSub}>{v.tradeName}</Text>
                          ) : null}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* ── Products multi-select (only shown after vendor selected) ── */}
              {selectedVendor && (
                <View>
                  <Text style={s.fieldLabel}>
                    Products <Text style={s.required}>*</Text>
                    <Text style={s.fieldHint}> (tap to select)</Text>
                  </Text>

                  {/* Collapsed trigger */}
                  <TouchableOpacity
                    style={s.dropdownTrigger}
                    onPress={() => setProductDropdownOpen(v => !v)}
                    activeOpacity={0.85}>
                    <Text style={Object.keys(selectedProducts).length > 0 ? s.dropdownValue : s.dropdownPlaceholder}>
                      {Object.keys(selectedProducts).length > 0
                        ? `${Object.keys(selectedProducts).length} product(s) selected`
                        : 'Select one or more products…'}
                    </Text>
                    <ChevronDown size={16} color="#94a3b8" />
                  </TouchableOpacity>

                  {/* Product list */}
                  {productDropdownOpen && (
                    <View style={s.dropdownList}>
                      <ScrollView style={{ maxHeight: 260 }} nestedScrollEnabled>
                        {selectedVendor.products.length === 0 ? (
                          <Text style={s.dropdownEmpty}>No products for this vendor</Text>
                        ) : selectedVendor.products.map(p => {
                          const checked = !!selectedProducts[p.id];
                          return (
                            <TouchableOpacity
                              key={p.id}
                              style={[s.productRow, checked && s.productRowActive]}
                              onPress={() => toggleProduct(p)}
                              activeOpacity={0.85}>
                              <View style={[s.checkbox, checked && s.checkboxActive]}>
                                {checked && <Text style={s.checkmark}>✓</Text>}
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={[s.productName, checked && s.productNameActive]}>
                                  {p.productName}
                                </Text>
                                <Text style={s.productMeta}>
                                  {p.productCategory} · {p.unit} · ₹{p.unitPrice.toLocaleString()}
                                </Text>
                                {p.description ? (
                                  <Text style={s.productDesc} numberOfLines={1}>{p.description}</Text>
                                ) : null}
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}

                  {/* Quantity inputs for selected products */}
                  {Object.keys(selectedProducts).length > 0 && (
                    <View style={s.qtySection}>
                      <Text style={s.qtySectionTitle}>Set Quantities</Text>
                      {Object.entries(selectedProducts).map(([productId, qty]) => {
                        const p = selectedVendor.products.find(pr => pr.id === productId)!;
                        return (
                          <View key={productId} style={s.qtyLine}>
                            <Text style={s.qtyLineName} numberOfLines={1}>{p.productName}</Text>
                            <View style={s.qtyRow}>
                              <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(productId, qty - 1)}>
                                <Text style={s.qtyBtnText}>−</Text>
                              </TouchableOpacity>
                              <TextInput
                                style={s.qtyInput}
                                value={String(qty)}
                                keyboardType="numeric"
                                onChangeText={t => {
                                  const n = parseInt(t, 10);
                                  if (!isNaN(n) && n >= 1) setQty(productId, n);
                                }}
                              />
                              <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(productId, qty + 1)}>
                                <Text style={s.qtyBtnText}>+</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Popup footer */}
            <View style={s.popupFooter}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setAddPopupVisible(false)}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.primaryBtn,
                  (!selectedVendorId || Object.keys(selectedProducts).length === 0) && s.primaryBtnDisabled,
                ]}
                onPress={handleAddItems}
                disabled={!selectedVendorId || Object.keys(selectedProducts).length === 0}
                activeOpacity={0.85}>
                <Text style={s.primaryBtnText}>Add to Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Overlay & modal shell
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '92%',
    minHeight: 480,
    flexDirection: 'column',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 3 },

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
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: { backgroundColor: '#6366f1' },
  stepDotText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  stepDotTextActive: { color: '#fff' },
  stepLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  stepLabelActive: { color: '#6366f1', fontWeight: '700' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#e2e8f0', marginHorizontal: 10 },
  stepLineActive: { backgroundColor: '#6366f1' },

  // Table area
  tableTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tableTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6366f1',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderStyle: 'dashed',
  },
  emptyText: { fontSize: 14, color: '#94a3b8' },

  // Items table
  table: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  th: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  trAlt: { backgroundColor: '#fafafa' },
  td: { fontSize: 13, color: '#374151' },
  tdBold: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  tdSub: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: '#f0fdf4',
  },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  totalValue: { fontSize: 16, fontWeight: '800', color: '#10b981' },

  // Qty controls
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 14, color: '#374151', fontWeight: '700', lineHeight: 16 },
  qtyVal: { fontSize: 13, fontWeight: '700', color: '#1e293b', minWidth: 24, textAlign: 'center' },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 18,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelBtnText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  primaryBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 10,
  },
  primaryBtnDisabled: { opacity: 0.45 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  placeBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 10,
  },
  placeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Review step
  reviewHeading: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 10 },
  vendorChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  vendorChipName: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  vendorChipCount: { fontSize: 12, color: '#64748b' },

  errorBanner: {
    marginTop: 14,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorBannerText: { fontSize: 13, color: '#dc2626', fontWeight: '600' },

  // Notification checkboxes in review step
  notifCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: '#f8fafc',
    gap: 2,
  },
  notifVendorName: { fontSize: 12, fontWeight: '700', color: '#6366f1', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 7, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  notifLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  notifValue: { fontSize: 12, color: '#64748b', marginTop: 1 },

  // ── Add-item popup ──
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    maxHeight: '92%',
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  popupTitle: { fontSize: 17, fontWeight: '800', color: '#1e293b' },
  popupFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },

  // Field labels
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 },
  required: { color: '#ef4444' },
  fieldHint: { fontSize: 11, color: '#94a3b8', fontWeight: '400' },

  // Dropdown
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#fafafa',
  },
  dropdownValue: { fontSize: 14, color: '#1e293b', flex: 1 },
  dropdownPlaceholder: { fontSize: 14, color: '#94a3b8', flex: 1 },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    zIndex: 99,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  dropdownItemActive: { backgroundColor: '#eef2ff' },
  dropdownItemText: { fontSize: 14, color: '#1e293b' },
  dropdownItemTextActive: { color: '#6366f1', fontWeight: '700' },
  dropdownItemSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  dropdownEmpty: { padding: 14, fontSize: 13, color: '#94a3b8' },

  // Product multi-select rows
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  productRowActive: { backgroundColor: '#eef2ff' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  checkmark: { fontSize: 11, color: '#fff', fontWeight: '900', lineHeight: 14 },
  productName: { fontSize: 13, color: '#374151', fontWeight: '500' },
  productNameActive: { color: '#6366f1', fontWeight: '700' },
  productMeta: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  productDesc: { fontSize: 11, color: '#b0b8c5', marginTop: 1 },

  // Qty section inside popup
  qtySection: {
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  qtySectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: '#fafafa',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  qtyLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  qtyLineName: { fontSize: 13, color: '#374151', flex: 1, marginRight: 10 },
  qtyInput: {
    width: 42,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingVertical: 3,
  },
});

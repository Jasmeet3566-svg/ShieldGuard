import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useRouter } from 'expo-router';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  Dimensions, Modal, TextInput, Platform
} from 'react-native';
import {
  Shield, LayoutDashboard, Users, Bell, Settings, User,
  ShieldCheck, CheckCircle, ShieldAlert, MapPin, Search,
  Menu, ChevronRight, Plus, UserPlus, Edit3, XCircle
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function PortalScreen() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState<any>(null);
  const [editingGuard, setEditingGuard] = useState<any>(null);

  const [guards, setGuards] = useState([
    { id: 'GD-1024', name: 'John Smith', station: 'Sector 4', status: 'On Duty', joined: 'Mar 2026', fullName: 'John Smith', assignedSite: 'Sector 4' },
    { id: 'GD-1025', name: 'Sarah Connor', station: 'Entry A', status: 'On Break', joined: 'Feb 2026', fullName: 'Sarah Connor', assignedSite: 'Entry A' },
    { id: 'GD-1026', name: 'Mike Tyson', station: 'Warehouse', status: 'On Duty', joined: 'Jan 2026', fullName: 'Mike Tyson', assignedSite: 'Warehouse' },
  ]);

  const { width: windowWidth } = Dimensions.get('window');
  const isDesktop = windowWidth > 1024;
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading]);

  if (loading) return null;

  return (
    <View style={styles.container}>
      {(isDesktop || isSidebarOpen) && (
        <View style={[styles.sidebar, !isDesktop && styles.mobileSidebar]}>
          {!isDesktop && (
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setIsSidebarOpen(false)} />
          )}
          <View style={styles.sidebarContent}>
            <View style={styles.sidebarHeader}>
              <ShieldAlert color="#7c3aed" size={32} />
              <Text style={styles.brandName}>ShieldGuard</Text>
            </View>
            <View style={styles.navItems}>
              <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'Dashboard'} onPress={() => { setActiveTab('Dashboard'); if (!isDesktop) setIsSidebarOpen(false); }} />
              <NavItem icon={<Users size={20} />} label="Guards" active={activeTab === 'Guards'} onPress={() => { setActiveTab('Guards'); if (!isDesktop) setIsSidebarOpen(false); }} />
              <NavItem icon={<Bell size={20} />} label="Alerts" active={activeTab === 'Alerts'} onPress={() => { setActiveTab('Alerts'); if (!isDesktop) setIsSidebarOpen(false); }} />
              <NavItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'Settings'} onPress={() => { setActiveTab('Settings'); if (!isDesktop) setIsSidebarOpen(false); }} />
            </View>
            <View style={styles.sidebarFooter}>
              <View style={styles.userProfile}>
                <View style={styles.avatar}><User size={20} color="#64748b" /></View>
                <View>
                  <Text style={styles.userName}>Admin User</Text>
                  <Text style={styles.userRole}>Super Admin</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={styles.mainContent}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {!isDesktop && (
              <TouchableOpacity style={styles.menuBtn} onPress={toggleSidebar}>
                <Menu size={24} color="#64748b" />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle} numberOfLines={1}>{activeTab}</Text>
          </View>
          <View style={styles.headerRight}>
            {isDesktop && (
              <View style={styles.searchBar}>
                <Search size={18} color="#94a3b8" />
                <Text style={styles.placeholderText}>Search dashboard...</Text>
              </View>
            )}
            <TouchableOpacity style={styles.notificationBtn}>
              <Bell size={20} color="#64748b" />
              <View style={styles.badge} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollArea}>
          {activeTab === 'Dashboard' ? (
            <>
              <View style={styles.statsGrid}>
                <StatCard label="Total Guards" value={guards.length.toString()} trend="+12.5%" icon={<Users color="#7c3aed" />} color="#f5f3ff" />
                <StatCard label="Active Now" value="842" trend="+5.2%" icon={<CheckCircle color="#10b981" />} color="#f0fdf4" />
                <StatCard label="Critical Alerts" value="12" trend="-2.4%" icon={<ShieldAlert color="#ef4444" />} color="#fef2f2" />
                <StatCard label="Reports Today" value="156" trend="+18.8%" icon={<LayoutDashboard color="#3b82f6" />} color="#eff6ff" />
              </View>
              <View style={styles.contentLayout}>
                <View style={styles.tableSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Incidents</Text>
                    <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
                  </View>
                  <View style={styles.table}>
                    <TableHeader />
                    <TableRow id="#728" guard="John Smith" location="Sector 4" status="Critical" time="2 min ago" />
                    <TableRow id="#729" guard="Sarah Connor" location="Entry A" status="Cleared" time="15 min ago" />
                    <TableRow id="#730" guard="Mike Tyson" location="Warehouse" status="Pending" time="45 min ago" />
                  </View>
                </View>
                {isWeb && (
                  <View style={styles.notifPanel}>
                    <Text style={styles.sectionTitle}>Live Activity</Text>
                    <NotificationItem sender="Isaiah Rivera" msg="started shift at Station B" time="2min ago" />
                    <NotificationItem sender="Samuel Young" msg="reported suspicious activity" time="20min ago" />
                    <NotificationItem sender="Christian Brooks" msg="completed checklist" time="1hr ago" />
                  </View>
                )}
              </View>
            </>
          ) : activeTab === 'Guards' ? (
            <GuardsView
              guards={guards}
              onAddPress={() => { setEditingGuard(null); setIsModalVisible(true); }}
              onViewDetails={(guard: any) => { setSelectedGuard(guard); setIsDetailsVisible(true); }}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>This {activeTab} section is coming soon!</Text>
            </View>
          )}
        </ScrollView>

        <CreateGuardModal
          visible={isModalVisible}
          initialData={editingGuard}
          onClose={() => { setIsModalVisible(false); setEditingGuard(null); }}
          onAdd={(guardData: any) => {
            if (editingGuard) {
              setGuards(guards.map(g => g.id === editingGuard.id ? { ...g, ...guardData, name: guardData.fullName, station: guardData.assignedSite } : g));
            } else {
              const id = `GD-${Math.floor(1000 + Math.random() * 9000)}`;
              setGuards([...guards, { id, ...guardData, name: guardData.fullName, station: guardData.assignedSite || 'Unassigned', status: 'On Duty', joined: 'Mar 2026' }]);
            }
            setIsModalVisible(false);
            setEditingGuard(null);
          }}
        />

        <GuardDetailsModal
          visible={isDetailsVisible}
          guard={selectedGuard}
          onClose={() => setIsDetailsVisible(false)}
          onEdit={(guard: any) => { setIsDetailsVisible(false); setEditingGuard(guard); setIsModalVisible(true); }}
        />
      </View>
    </View>
  );
}

// ─── Small reusable UI components ────────────────────────────────────────────

function NavItem({ icon, label, active, onPress }: any) {
  return (
    <TouchableOpacity style={[styles.navItem, active && styles.navItemActive]} onPress={onPress}>
      <View style={[styles.navIcon, active && styles.navIconActive]}>{icon}</View>
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatCard({ label, value, trend, icon, color }: any) {
  return (
    <Animated.View entering={FadeInRight.delay(200).duration(800)} style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color }]}>{icon}</View>
      <View style={styles.statInfo}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.statValueRow}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={[styles.statTrend, { color: trend.startsWith('+') ? '#10b981' : '#ef4444' }]}>{trend}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function TableHeader() {
  return (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, { flex: 0.5 }]}>ID</Text>
      <Text style={styles.headerCell}>Guard Name</Text>
      <Text style={styles.headerCell}>Location</Text>
      <Text style={styles.headerCell}>Status</Text>
      <Text style={styles.headerCell}>Time</Text>
    </View>
  );
}

function TableRow({ id, guard, location, status, time }: any) {
  const statusColor = status === 'Critical' ? '#ef4444' : status === 'Cleared' ? '#10b981' : '#f59e0b';
  const statusBg = status === 'Critical' ? '#fef2f2' : status === 'Cleared' ? '#f0fdf4' : '#fffbeb';
  return (
    <View style={styles.tableRow}>
      <Text style={[styles.cellText, { flex: 0.5, color: '#94a3b8' }]}>{id}</Text>
      <View style={styles.cellContainer}><View style={styles.smallAvatar} /><Text style={styles.cellTextBold}>{guard}</Text></View>
      <Text style={styles.cellText}>{location}</Text>
      <View style={[styles.statusBadge, { backgroundColor: statusBg }]}><Text style={[styles.statusText, { color: statusColor }]}>{status}</Text></View>
      <Text style={styles.cellText}>{time}</Text>
    </View>
  );
}

function NotificationItem({ sender, msg, time }: any) {
  return (
    <View style={styles.notifItem}>
      <View style={styles.notifAvatar} />
      <View style={styles.notifContent}>
        <Text style={styles.notifTitle} numberOfLines={1}><Text style={styles.bold}>{sender}</Text> {msg}</Text>
        <Text style={styles.notifTime}>{time}</Text>
      </View>
    </View>
  );
}

function GuardsView({ guards, onAddPress, onViewDetails }: { guards: any[], onAddPress: () => void, onViewDetails: (guard: any) => void }) {
  return (
    <View style={styles.guardsView}>
      <View style={styles.guardsHeader}>
        <View>
          <Text style={styles.guardsTitle}>Guard Roster</Text>
          <Text style={styles.guardsSubtitle}>Manage and monitor your security team.</Text>
        </View>
        <TouchableOpacity style={styles.addGuardBtn} onPress={onAddPress}>
          <UserPlus size={20} color="#fff" />
          <Text style={styles.addGuardBtnText}>Register Guard</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.guardsGrid}>
        {guards.map((guard: any) => (
          <View key={guard.id} style={styles.guardCard}>
            <View style={styles.guardCardTop}>
              <View style={styles.guardAvatar}><User size={24} color="#7c3aed" /></View>
              <View style={styles.guardStatus}>
                <View style={[styles.statusDot, { backgroundColor: guard.status === 'On Duty' ? '#10b981' : '#f59e0b' }]} />
                <Text style={styles.guardStatusText}>{guard.status}</Text>
              </View>
            </View>
            <View style={styles.guardCardBody}>
              <Text style={styles.guardName}>{guard.name}</Text>
              <Text style={styles.guardId}>{guard.id}</Text>
              <View style={styles.guardDetailRow}><MapPin size={14} color="#94a3b8" /><Text style={styles.guardDetailText}>{guard.station}</Text></View>
              <View style={styles.guardDetailRow}><ShieldCheck size={14} color="#94a3b8" /><Text style={styles.guardDetailText}>Joined {guard.joined}</Text></View>
            </View>
            <View style={styles.guardCardFooter}>
              <TouchableOpacity style={styles.guardActionBtn} onPress={() => onViewDetails(guard)}>
                <Text style={styles.guardActionText}>View Profile</Text>
                <ChevronRight size={16} color="#7c3aed" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── InfoRow — left summary panel helper ─────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoRowLabel}>{label}</Text>
      <Text style={styles.infoRowValue} numberOfLines={1}>{value || '—'}</Text>
    </View>
  );
}

// ─── FormInput ───────────────────────────────────────────────────────────────

function FormInput({ label, value, onChange, placeholder, editable = true }: any) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        style={[styles.formInput, !editable && styles.disabledInput]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        editable={editable}
      />
    </View>
  );
}

// ─── CreateGuardModal — new horizontal stepper design ────────────────────────

function CreateGuardModal({ visible, onClose, onAdd, initialData }: { visible: boolean, onClose: () => void, onAdd: (data: any) => void, initialData?: any }) {
  const blankForm = {
    fullName: '', dob: '', gender: '', nationality: '', email: '', phone: '', role: 'Guard', bloodGroup: '', maritalStatus: '',
    currentAddress: { street: '', city: '', state: '', postalCode: '', country: '' },
    permanentAddress: { street: '', city: '', state: '', postalCode: '', country: '' },
    sameAsCurrent: false, nearestPoliceStation: '',
    identityProof: { type: 'Aadhaar Card', status: 'Pending' },
    addressProof: { type: 'Driving License', status: 'Pending' },
    verificationStatus: 'Pending', backgroundCheckStatus: 'Pending',
    assignedSite: '', shift: 'Day', workingHours: '8', joiningDate: new Date().toISOString().split('T')[0],
    salaryType: 'Monthly', salaryAmount: '', bankAccount: '', ifscCode: '', upiId: '', pfEsiNumber: '',
    emergencyContact: { name: '', phone: '', relationship: '' },
    medicalConditions: '', equipment: [] as string[],
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(blankForm);

  useEffect(() => {
    if (visible) {
      setCurrentStep(1);
      setFormData(initialData ? { ...blankForm, ...initialData } : blankForm);
    }
  }, [visible]);

  const steps = ['Personal Details', 'Address & Location', 'Documents', 'Job Details', 'Payroll', 'Other Details'];

  const updateFormData = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  const updateNested = (parent: string, field: string, value: any) => setFormData(prev => ({ ...prev, [parent]: { ...(prev as any)[parent], [field]: value } }));

  const nextStep = () => { if (currentStep < 6) setCurrentStep(s => s + 1); else onAdd(formData); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.newMegaModal}>

          {/* Horizontal stepper */}
          <View style={styles.hStepperBar}>
            <View style={styles.hStepperSteps}>
              {steps.map((step, index) => {
                const num = index + 1;
                const isActive = currentStep === num;
                const isDone = currentStep > num;
                return (
                  <View key={step} style={styles.hStepItem}>
                    {index > 0 && <View style={[styles.hConnector, isDone && styles.hConnectorDone]} />}
                    <View style={[styles.hCircle, isActive && styles.hCircleActive, isDone && styles.hCircleDone]}>
                      {isDone
                        ? <CheckCircle size={13} color="#fff" />
                        : <Text style={[styles.hCircleNum, isActive && styles.hCircleNumActive]}>{num}</Text>
                      }
                    </View>
                    <Text style={[styles.hStepLabel, isActive && styles.hStepLabelActive, isDone && styles.hStepLabelDone]} numberOfLines={2}>{step}</Text>
                  </View>
                );
              })}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.hCloseBtn}>
              <XCircle size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Two-panel body */}
          <ScrollView contentContainerStyle={styles.twoPanelBody} keyboardShouldPersistTaps="handled">
            <View style={styles.twoPanelRow}>

              {/* Left — summary card */}
              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <View style={styles.infoCardBadge}><Text style={styles.infoCardBadgeText}>{currentStep}</Text></View>
                  <Text style={styles.infoCardTitle}>{steps[currentStep - 1]}</Text>
                </View>
                <View style={styles.infoCardBody}>
                  {currentStep === 1 && (<>
                    <InfoRow label="Role" value={formData.role} />
                    <InfoRow label="Blood Group" value={formData.bloodGroup} />
                    <InfoRow label="Gender" value={formData.gender} />
                    <InfoRow label="Marital Status" value={formData.maritalStatus} />
                    <InfoRow label="Nationality" value={formData.nationality} />
                    <InfoRow label="Date of Birth" value={formData.dob} />
                  </>)}
                  {currentStep === 2 && (<>
                    <InfoRow label="Street" value={formData.currentAddress.street} />
                    <InfoRow label="City" value={formData.currentAddress.city} />
                    <InfoRow label="State" value={formData.currentAddress.state} />
                    <InfoRow label="Postal Code" value={formData.currentAddress.postalCode} />
                    <InfoRow label="Police Station" value={formData.nearestPoliceStation} />
                  </>)}
                  {currentStep === 3 && (<>
                    <InfoRow label="Identity Proof" value={formData.identityProof.type} />
                    <InfoRow label="Verification" value={formData.verificationStatus} />
                    <InfoRow label="Bg Check" value={formData.backgroundCheckStatus} />
                    <InfoRow label="Address Proof" value={formData.addressProof.type} />
                  </>)}
                  {currentStep === 4 && (<>
                    <InfoRow label="Role" value={formData.role} />
                    <InfoRow label="Shift" value={formData.shift} />
                    <InfoRow label="Working Hours" value={`${formData.workingHours}h/day`} />
                    <InfoRow label="Joining Date" value={formData.joiningDate} />
                  </>)}
                  {currentStep === 5 && (<>
                    <InfoRow label="Salary Type" value={formData.salaryType} />
                    <InfoRow label="Amount" value={formData.salaryAmount} />
                    <InfoRow label="IFSC" value={formData.ifscCode} />
                    <InfoRow label="UPI ID" value={formData.upiId} />
                  </>)}
                  {currentStep === 6 && (<>
                    <InfoRow label="Emergency" value={formData.emergencyContact.name} />
                    <InfoRow label="Phone" value={formData.emergencyContact.phone} />
                    <InfoRow label="Relationship" value={formData.emergencyContact.relationship} />
                    <InfoRow label="Equipment" value={formData.equipment.join(', ')} />
                  </>)}
                </View>
              </View>

              {/* Right — editable card */}
              <View style={styles.editCard}>
                {currentStep === 1 && (<>
                  <Text style={styles.editCardSectionTitle}>Personal Information</Text>
                  <View style={styles.fieldGrid}>
                    <FormInput label="Full Name *" value={formData.fullName} onChange={(v: string) => updateFormData('fullName', v)} placeholder="John Smith" />
                    <FormInput label="Date of Birth *" value={formData.dob} onChange={(v: string) => updateFormData('dob', v)} placeholder="YYYY-MM-DD" />
                    <FormInput label="Gender" value={formData.gender} onChange={(v: string) => updateFormData('gender', v)} placeholder="Male / Female" />
                    <FormInput label="Nationality" value={formData.nationality} onChange={(v: string) => updateFormData('nationality', v)} placeholder="e.g. Indian" />
                    <FormInput label="Email *" value={formData.email} onChange={(v: string) => updateFormData('email', v)} placeholder="john@example.com" />
                    <FormInput label="Phone *" value={formData.phone} onChange={(v: string) => updateFormData('phone', v)} placeholder="+91 9XXXXXXXXX" />
                    <FormInput label="Blood Group ⚠️" value={formData.bloodGroup} onChange={(v: string) => updateFormData('bloodGroup', v)} placeholder="O+" />
                    <FormInput label="Marital Status" value={formData.maritalStatus} onChange={(v: string) => updateFormData('maritalStatus', v)} placeholder="Married / Single" />
                  </View>
                </>)}

                {currentStep === 2 && (<>
                  <Text style={styles.editCardSectionTitle}>Current Address</Text>
                  <View style={styles.fieldGrid}>
                    <FormInput label="Street" value={formData.currentAddress.street} onChange={(v: string) => updateNested('currentAddress', 'street', v)} placeholder="123 Main St" />
                    <FormInput label="City" value={formData.currentAddress.city} onChange={(v: string) => updateNested('currentAddress', 'city', v)} />
                    <FormInput label="State" value={formData.currentAddress.state} onChange={(v: string) => updateNested('currentAddress', 'state', v)} />
                    <FormInput label="Postal Code" value={formData.currentAddress.postalCode} onChange={(v: string) => updateNested('currentAddress', 'postalCode', v)} />
                  </View>
                  <TouchableOpacity style={styles.checkboxRow} onPress={() => updateFormData('sameAsCurrent', !formData.sameAsCurrent)}>
                    <View style={[styles.checkbox, formData.sameAsCurrent && styles.checkboxActive]} />
                    <Text style={styles.checkboxLabel}>Permanent address same as current</Text>
                  </TouchableOpacity>
                  {!formData.sameAsCurrent && (<>
                    <Text style={styles.editCardSectionTitle}>Permanent Address</Text>
                    <View style={styles.fieldGrid}>
                      <FormInput label="Street" value={formData.permanentAddress.street} onChange={(v: string) => updateNested('permanentAddress', 'street', v)} />
                      <FormInput label="City" value={formData.permanentAddress.city} onChange={(v: string) => updateNested('permanentAddress', 'city', v)} />
                    </View>
                  </>)}
                  <FormInput label="Nearest Police Station 🔥" value={formData.nearestPoliceStation} onChange={(v: string) => updateFormData('nearestPoliceStation', v)} />
                </>)}

                {currentStep === 3 && (<>
                  <Text style={styles.editCardSectionTitle}>Identity Proof</Text>
                  <View style={styles.docUploadBox}><Text style={styles.docName}>Aadhaar Card</Text><TouchableOpacity style={styles.uploadBtn}><Plus size={14} color="#6C2BD9" /><Text style={styles.uploadBtnText}>Upload</Text></TouchableOpacity></View>
                  <View style={styles.docUploadBox}><Text style={styles.docName}>PAN Card</Text><TouchableOpacity style={styles.uploadBtn}><Plus size={14} color="#6C2BD9" /><Text style={styles.uploadBtnText}>Upload</Text></TouchableOpacity></View>
                  <Text style={styles.editCardSectionTitle}>Address Proof</Text>
                  <View style={styles.docUploadBox}><Text style={styles.docName}>Driving License / Voter ID</Text><TouchableOpacity style={styles.uploadBtn}><Plus size={14} color="#6C2BD9" /><Text style={styles.uploadBtnText}>Upload</Text></TouchableOpacity></View>
                  <Text style={styles.editCardSectionTitle}>Verification Status</Text>
                  <View style={styles.fieldGrid}>
                    <FormInput label="Police Verification" value={formData.verificationStatus} onChange={(v: string) => updateFormData('verificationStatus', v)} placeholder="Pending / Verified" />
                    <FormInput label="Background Check" value={formData.backgroundCheckStatus} onChange={(v: string) => updateFormData('backgroundCheckStatus', v)} placeholder="Pending / Passed" />
                  </View>
                </>)}

                {currentStep === 4 && (<>
                  <Text style={styles.editCardSectionTitle}>Job & Deployment Details</Text>
                  <View style={styles.fieldGrid}>
                    <FormInput label="Role *" value={formData.role} onChange={(v: string) => updateFormData('role', v)} />
                    <FormInput label="Assigned Site *" value={formData.assignedSite} onChange={(v: string) => updateFormData('assignedSite', v)} placeholder="e.g. City Mall South Gate" />
                    <FormInput label="Shift" value={formData.shift} onChange={(v: string) => updateFormData('shift', v)} placeholder="Day / Night" />
                    <FormInput label="Working Hours / Day" value={formData.workingHours} onChange={(v: string) => updateFormData('workingHours', v)} />
                    <FormInput label="Joining Date" value={formData.joiningDate} onChange={(v: string) => updateFormData('joiningDate', v)} />
                  </View>
                </>)}

                {currentStep === 5 && (<>
                  <Text style={styles.editCardSectionTitle}>Payroll Information</Text>
                  <View style={styles.fieldGrid}>
                    <FormInput label="Salary Type" value={formData.salaryType} onChange={(v: string) => updateFormData('salaryType', v)} placeholder="Monthly / Weekly" />
                    <FormInput label="Salary Amount" value={formData.salaryAmount} onChange={(v: string) => updateFormData('salaryAmount', v)} placeholder="₹ 0" />
                    <FormInput label="Bank Account No." value={formData.bankAccount} onChange={(v: string) => updateFormData('bankAccount', v)} />
                    <FormInput label="IFSC Code" value={formData.ifscCode} onChange={(v: string) => updateFormData('ifscCode', v)} />
                    <FormInput label="UPI ID (Optional)" value={formData.upiId} onChange={(v: string) => updateFormData('upiId', v)} />
                    <FormInput label="PF / ESI Number" value={formData.pfEsiNumber} onChange={(v: string) => updateFormData('pfEsiNumber', v)} />
                  </View>
                </>)}

                {currentStep === 6 && (<>
                  <Text style={styles.editCardSectionTitle}>Emergency Contact</Text>
                  <View style={styles.fieldGrid}>
                    <FormInput label="Name" value={formData.emergencyContact.name} onChange={(v: string) => updateNested('emergencyContact', 'name', v)} />
                    <FormInput label="Phone" value={formData.emergencyContact.phone} onChange={(v: string) => updateNested('emergencyContact', 'phone', v)} />
                    <FormInput label="Relationship" value={formData.emergencyContact.relationship} onChange={(v: string) => updateNested('emergencyContact', 'relationship', v)} />
                  </View>
                  <Text style={styles.editCardSectionTitle}>Other Details</Text>
                  <FormInput label="Medical Conditions" value={formData.medicalConditions} onChange={(v: string) => updateFormData('medicalConditions', v)} placeholder="None / Diabetes / etc." />
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Assigned Equipment</Text>
                    <View style={styles.tagCloud}>
                      {['Radio', 'Torch', 'Baton', 'Handcuffs', 'Vest'].map(eq => (
                        <TouchableOpacity
                          key={eq}
                          style={[styles.tag, formData.equipment.includes(eq) && styles.tagActive]}
                          onPress={() => {
                            const newEq = formData.equipment.includes(eq) ? formData.equipment.filter(e => e !== eq) : [...formData.equipment, eq];
                            updateFormData('equipment', newEq);
                          }}
                        >
                          <Text style={[styles.tagText, formData.equipment.includes(eq) && styles.tagTextActive]}>{eq}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>)}
              </View>

            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.newModalFooter}>
            <TouchableOpacity style={styles.saveExitBtn} onPress={onClose}>
              <Text style={styles.saveExitText}>Save & Exit</Text>
            </TouchableOpacity>
            <View style={styles.footerNav}>
              <TouchableOpacity style={[styles.prevBtn, currentStep === 1 && styles.disabledBtn]} onPress={prevStep} disabled={currentStep === 1}>
                <Text style={styles.prevBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
                <Text style={styles.nextBtnText}>{currentStep === 6 ? 'Register Guard' : 'Next →'}</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
}

// ─── GuardDetailsModal ────────────────────────────────────────────────────────

function GuardDetailsModal({ visible, guard, onClose, onEdit }: { visible: boolean, guard: any, onClose: () => void, onEdit: (guard: any) => void }) {
  if (!guard) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.detailsModal}>
          <View style={styles.detailsHeader}>
            <View>
              <Text style={styles.detailsTitle}>Guard Profile</Text>
              <Text style={styles.guardId}>{guard.id}</Text>
            </View>
            <TouchableOpacity onPress={onClose}><XCircle size={28} color="#94a3b8" /></TouchableOpacity>
          </View>
          <ScrollView style={styles.detailsScroll}>
            <Section title="Personal Details">
              <DetailRow label="Full Name" value={guard.fullName} />
              <DetailRow label="Email" value={guard.email} />
              <DetailRow label="Phone" value={guard.phone} />
              <DetailRow label="Blood Group" value={guard.bloodGroup} />
            </Section>
            <Section title="Address">
              <DetailRow label="Current" value={guard.currentAddress ? `${guard.currentAddress.street}, ${guard.currentAddress.city}` : '—'} />
              <DetailRow label="Police Station" value={guard.nearestPoliceStation} />
            </Section>
            <Section title="Employment">
              <DetailRow label="Site" value={guard.assignedSite} />
              <DetailRow label="Shift" value={guard.shift} />
              <DetailRow label="Verification" value={guard.verificationStatus} />
            </Section>
            <Section title="Payroll">
              <DetailRow label="Salary" value={guard.salaryAmount ? `${guard.salaryAmount} (${guard.salaryType})` : 'N/A'} />
              <DetailRow label="Bank A/C" value={guard.bankAccount} />
            </Section>
            <Section title="Other">
              <DetailRow label="Equipment" value={guard.equipment?.join(', ') || 'None'} />
              <DetailRow label="Med. Condition" value={guard.medicalConditions || 'None'} />
            </Section>
          </ScrollView>
          <View style={styles.detailsFooter}>
            <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(guard)}>
              <Edit3 size={20} color="#fff" />
              <Text style={styles.editBtnText}>Edit Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Section({ title, children }: any) {
  return (
    <View style={styles.detailsSection}>
      <Text style={styles.detailsSectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '---'}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Layout
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#f8fafc' },
  sidebar: { width: 260, backgroundColor: '#fff', borderRightWidth: 1, borderRightColor: '#e2e8f0', zIndex: 1000 },
  sidebarContent: { flex: 1, padding: 24 },
  mobileSidebar: { position: 'absolute', left: 0, top: 0, bottom: 0, shadowColor: '#000', shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  overlay: { position: 'absolute', left: 260, top: 0, bottom: 0, width: width, backgroundColor: 'rgba(0,0,0,0.3)' },
  sidebarHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 48, gap: 12 },
  brandName: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
  navItems: { flex: 1, gap: 8 },
  navItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, gap: 12 },
  navItemActive: { backgroundColor: '#7c3aed' },
  navIcon: { color: '#64748b' },
  navIconActive: { color: '#fff' },
  navLabel: { fontSize: 15, fontWeight: '600', color: '#64748b' },
  navLabelActive: { color: '#fff' },
  sidebarFooter: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 24 },
  userProfile: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  userRole: { fontSize: 12, color: '#64748b' },

  // Main content
  mainContent: { flex: 1 },
  header: { height: 80, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  menuBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1e293b' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 16, height: 44, borderRadius: 12, width: 300, gap: 10 },
  placeholderText: { color: '#94a3b8', fontSize: 14 },
  notificationBtn: { position: 'relative' },
  badge: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  scrollArea: { padding: 32 },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  statCard: { minWidth: isWeb ? 240 : width - 64, backgroundColor: '#fff', borderRadius: 20, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 20, borderWidth: 1, borderColor: '#e2e8f0', flexGrow: 1 },
  statIconContainer: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statInfo: { flex: 1 },
  statLabel: { fontSize: 14, color: '#64748b', marginBottom: 4 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  statTrend: { fontSize: 12, fontWeight: '600' },

  // Table
  contentLayout: { flexDirection: 'row', gap: 32 },
  tableSection: { flex: 2, backgroundColor: '#fff', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  viewAll: { color: '#7c3aed', fontWeight: '600' },
  table: { width: '100%' },
  tableHeader: { flexDirection: 'row', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginBottom: 16 },
  headerCell: { flex: 1, fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  cellContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  smallAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9' },
  cellTextBold: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  cellText: { flex: 1, fontSize: 14, color: '#64748b' },
  statusBadge: { flex: 1, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start', alignItems: 'center' },
  statusText: { fontSize: 12, fontWeight: '700' },

  // Notifications
  notifPanel: { flex: 1, backgroundColor: '#fff', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#e2e8f0', alignSelf: 'flex-start' },
  notifItem: { flexDirection: 'row', gap: 12, marginTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  notifAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, color: '#64748b', lineHeight: 20 },
  bold: { fontWeight: '700', color: '#1e293b' },
  notifTime: { fontSize: 12, color: '#94a3b8', marginTop: 4 },

  // Guards view
  guardsView: { flex: 1 },
  guardsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  guardsTitle: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  guardsSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  addGuardBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7c3aed', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 8 },
  addGuardBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  guardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  guardCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', minWidth: isWeb ? 280 : width - 48, flexGrow: 1 },
  guardCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  guardAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f5f3ff', justifyContent: 'center', alignItems: 'center' },
  guardStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  guardStatusText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  guardCardBody: { marginBottom: 16, gap: 6 },
  guardName: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  guardId: { fontSize: 13, color: '#94a3b8', marginBottom: 8 },
  guardDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  guardDetailText: { fontSize: 13, color: '#64748b' },
  guardCardFooter: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
  guardActionBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  guardActionText: { fontSize: 14, fontWeight: '600', color: '#7c3aed' },
  placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Modal overlay
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },

  // ── New horizontal stepper modal ──
  newMegaModal: { width: isWeb ? 900 : width - 16, maxHeight: isWeb ? 700 : '95%', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', flexDirection: 'column' },

  hStepperBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 14 },
  hStepperSteps: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  hStepItem: { flex: 1, alignItems: 'center', position: 'relative' },
  hConnector: { position: 'absolute', top: 14, right: '50%', left: '-50%', height: 2, backgroundColor: '#e2e8f0' },
  hConnectorDone: { backgroundColor: '#6C2BD9' },
  hCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  hCircleActive: { backgroundColor: '#6C2BD9' },
  hCircleDone: { backgroundColor: '#6C2BD9' },
  hCircleNum: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  hCircleNumActive: { color: '#fff' },
  hStepLabel: { fontSize: 10, color: '#94a3b8', textAlign: 'center', marginTop: 4 },
  hStepLabelActive: { color: '#6C2BD9', fontWeight: '700' },
  hStepLabelDone: { color: '#6C2BD9' },
  hCloseBtn: { marginLeft: 12 },

  twoPanelBody: { flexGrow: 1 },
  twoPanelRow: { flexDirection: isWeb ? 'row' : 'column', minHeight: isWeb ? 440 : undefined },

  // Left info card
  infoCard: { width: isWeb ? 220 : '100%', backgroundColor: '#f5f3ff', padding: 16, borderRightWidth: isWeb ? 1 : 0, borderBottomWidth: isWeb ? 0 : 1, borderColor: '#e2e8f0' },
  infoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  infoCardBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#6C2BD9', justifyContent: 'center', alignItems: 'center' },
  infoCardBadgeText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  infoCardTitle: { fontSize: 13, fontWeight: '700', color: '#3b0764', flex: 1 },
  infoCardBody: { gap: 10 },
  infoRow: { gap: 2 },
  infoRowLabel: { fontSize: 11, color: '#7c3aed', fontWeight: '600', textTransform: 'uppercase' },
  infoRowValue: { fontSize: 13, color: '#1e293b', fontWeight: '500' },

  // Right edit card
  editCard: { flex: 1, padding: 20 },
  editCardSectionTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginTop: 12, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  fieldGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  // Form elements
  formGroup: { minWidth: isWeb ? 180 : '100%', flex: 1 },
  formLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 4 },
  formInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: '#1e293b' },
  disabledInput: { backgroundColor: '#f1f5f9', color: '#94a3b8' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 8 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#6C2BD9' },
  checkboxActive: { backgroundColor: '#6C2BD9' },
  checkboxLabel: { fontSize: 13, color: '#475569' },

  // Document upload
  docUploadBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 },
  docName: { fontSize: 13, color: '#1e293b', fontWeight: '500' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f5f3ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  uploadBtnText: { fontSize: 12, color: '#6C2BD9', fontWeight: '600' },

  // Tags
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  tagActive: { backgroundColor: '#6C2BD9', borderColor: '#6C2BD9' },
  tagText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  tagTextActive: { color: '#fff' },

  // Modal footer
  newModalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  saveExitBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#6C2BD9' },
  saveExitText: { color: '#6C2BD9', fontWeight: '600', fontSize: 14 },
  footerNav: { flexDirection: 'row', gap: 10 },
  prevBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f1f5f9' },
  prevBtnText: { color: '#475569', fontWeight: '600', fontSize: 14 },
  disabledBtn: { opacity: 0.4 },
  nextBtn: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: 8, backgroundColor: '#6C2BD9' },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // GuardDetailsModal
  detailsModal: { width: isWeb ? 560 : width - 32, maxHeight: '85%', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  detailsTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  detailsScroll: { padding: 24 },
  detailsSection: { marginBottom: 20 },
  detailsSectionTitle: { fontSize: 14, fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase', marginBottom: 8 },
  sectionContent: { backgroundColor: '#f8fafc', borderRadius: 12, overflow: 'hidden' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  detailLabel: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  detailValue: { fontSize: 13, color: '#1e293b', fontWeight: '600', flex: 1, textAlign: 'right' },
  detailsFooter: { padding: 20, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  editBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: '#7c3aed', padding: 14, borderRadius: 12 },
  editBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

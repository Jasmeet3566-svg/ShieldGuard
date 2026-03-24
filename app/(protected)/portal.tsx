import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import {
  Bell,
  CheckCircle,
  ChevronRight,
  Edit3,
  LayoutDashboard,
  MapPin,
  Menu,
  Minus,
  Package,
  PanelLeft,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Store,
  User,
  UserPlus,
  Users,
  XCircle
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions, Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import AddVendorStepper, { VendorFormData } from '../../components/AddVendorStepper';
import CreateOrderStepper from '../../components/CreateOrderStepper';
import { useAuth } from '../AuthContext';
import API from '../client';

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
  const [usersExpanded, setUsersExpanded] = useState(false);
  const [employeesExpanded, setEmployeesExpanded] = useState(false);
  const [inventoryExpanded, setInventoryExpanded] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [employees, setEmployees] = useState([
    { id: 'GD-1024', name: 'John Smith', station: 'Sector 4', status: 'On Duty', joined: 'Mar 2026', fullName: 'John Smith', assignedSite: 'Sector 4' },
    { id: 'GD-1025', name: 'Sarah Connor', station: 'Entry A', status: 'On Break', joined: 'Feb 2026', fullName: 'Sarah Connor', assignedSite: 'Entry A' },
    { id: 'GD-1026', name: 'Mike Tyson', station: 'Warehouse', status: 'On Duty', joined: 'Jan 2026', fullName: 'Mike Tyson', assignedSite: 'Warehouse' },
  ]);

  const { width: windowWidth } = Dimensions.get('window');
  const isDesktop = windowWidth > 1024;
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading]);

  if (loading) return null;

  return (
    <View style={styles.container}>
      {(isDesktop || isSidebarOpen) && (
        <View style={[styles.sidebar, isSidebarCollapsed && styles.sidebarCollapsed, !isDesktop && styles.mobileSidebar]}>
          {!isDesktop && (
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setIsSidebarOpen(false)} />
          )}
          <View style={[styles.sidebarContent, isSidebarCollapsed && styles.sidebarContentCollapsed]}>

            {/* ── Header ── */}
            <View style={[styles.sidebarHeader, isSidebarCollapsed && styles.sidebarHeaderCollapsed]}>
              <ShieldAlert color="#7c3aed" size={22} />
              {!isSidebarCollapsed && <Text style={styles.brandName}>ShieldGuard</Text>}
              <TouchableOpacity
                style={[styles.collapseSidebarBtn, isSidebarCollapsed && { marginLeft: 0 }]}
                onPress={() => setIsSidebarCollapsed(prev => !prev)}
                activeOpacity={0.7}>
                <PanelLeft size={16} color={isSidebarCollapsed ? '#7c3aed' : '#9ca3af'} />
              </TouchableOpacity>
            </View>

            {/* ── Nav ── */}
            <View style={styles.navItems}>
              <NavItem icon={<LayoutDashboard size={16} />} label="Dashboard" active={activeTab === 'Dashboard'} collapsed={isSidebarCollapsed} onPress={() => { setActiveTab('Dashboard'); if (!isDesktop) setIsSidebarOpen(false); }} />
              <NavItem icon={<Bell size={16} />} label="Alerts" active={activeTab === 'Alerts'} collapsed={isSidebarCollapsed} onPress={() => { setActiveTab('Alerts'); if (!isDesktop) setIsSidebarOpen(false); }} />
              <NavItem icon={<Settings size={16} />} label="Settings" active={activeTab === 'Settings'} collapsed={isSidebarCollapsed} onPress={() => { setActiveTab('Settings'); if (!isDesktop) setIsSidebarOpen(false); }} />
              <NavItem icon={<Store size={16} />} label="Vendor" active={activeTab === 'Vendor'} collapsed={isSidebarCollapsed} onPress={() => { setActiveTab('Vendor'); if (!isDesktop) setIsSidebarOpen(false); }} />
              {/* Expandable Inventory group */}
              {isSidebarCollapsed ? (
                <TouchableOpacity
                  style={[styles.navItem, styles.navItemCollapsed, (activeTab === 'Stocks' || activeTab === 'Create Order' || activeTab === 'Order Placed') && styles.navItemActive]}
                  onPress={() => { setIsSidebarCollapsed(false); setInventoryExpanded(true); }}
                  activeOpacity={0.7}>
                  <Package size={16} color={(activeTab === 'Stocks' || activeTab === 'Create Order' || activeTab === 'Order Placed') ? '#111827' : '#6b7280'} />
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={styles.navGroupRow} onPress={() => setInventoryExpanded(prev => !prev)} activeOpacity={0.7}>
                    <View style={styles.navIcon}><Package size={16} color="#6b7280" /></View>
                    <Text style={styles.navGroupLabel}>Inventory</Text>
                    {inventoryExpanded ? <Minus size={14} color="#9ca3af" /> : <Plus size={14} color="#9ca3af" />}
                  </TouchableOpacity>
                  {inventoryExpanded && (
                    <View style={styles.subNavItems}>
                      <TouchableOpacity style={[styles.subNavItem, activeTab === 'Create Order' && styles.subNavItemActive]} onPress={() => { setActiveTab('Create Order'); if (!isDesktop) setIsSidebarOpen(false); }}>
                        <Text style={[styles.subNavLabel, activeTab === 'Create Order' && styles.subNavLabelActive]}>Create Order</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.subNavItem, activeTab === 'Stocks' && styles.subNavItemActive]} onPress={() => { setActiveTab('Stocks'); if (!isDesktop) setIsSidebarOpen(false); }}>
                        <Text style={[styles.subNavLabel, activeTab === 'Stocks' && styles.subNavLabelActive]}>Stocks</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.subNavItem, activeTab === 'Order Placed' && styles.subNavItemActive]} onPress={() => { setActiveTab('Order Placed'); if (!isDesktop) setIsSidebarOpen(false); }}>
                        <Text style={[styles.subNavLabel, activeTab === 'Order Placed' && styles.subNavLabelActive]}>Order Placed</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}

              {/* Expandable Employees group */}
              {isSidebarCollapsed ? (
                <TouchableOpacity
                  style={[styles.navItem, styles.navItemCollapsed, (activeTab === 'Create Employee' || activeTab === 'Employees List') && styles.navItemActive]}
                  onPress={() => { setIsSidebarCollapsed(false); setEmployeesExpanded(true); }}
                  activeOpacity={0.7}>
                  <Users size={16} color={(activeTab === 'Create Employee' || activeTab === 'Employees List') ? '#111827' : '#6b7280'} />
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={styles.navGroupRow} onPress={() => setEmployeesExpanded(prev => !prev)} activeOpacity={0.7}>
                    <View style={styles.navIcon}><Users size={16} color="#6b7280" /></View>
                    <Text style={styles.navGroupLabel}>Employees</Text>
                    {employeesExpanded ? <Minus size={14} color="#9ca3af" /> : <Plus size={14} color="#9ca3af" />}
                  </TouchableOpacity>
                  {employeesExpanded && (
                    <View style={styles.subNavItems}>
                      <TouchableOpacity style={[styles.subNavItem, activeTab === 'Create Employee' && styles.subNavItemActive]} onPress={() => { setActiveTab('Create Employee'); if (!isDesktop) setIsSidebarOpen(false); }}>
                        <Text style={[styles.subNavLabel, activeTab === 'Create Employee' && styles.subNavLabelActive]}>Create Employee</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.subNavItem, activeTab === 'Employees List' && styles.subNavItemActive]} onPress={() => { setActiveTab('Employees List'); if (!isDesktop) setIsSidebarOpen(false); }}>
                        <Text style={[styles.subNavLabel, activeTab === 'Employees List' && styles.subNavLabelActive]}>Employees</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}

              {/* Expandable Users group */}
              {isSidebarCollapsed ? (
                <TouchableOpacity
                  style={[styles.navItem, styles.navItemCollapsed, (activeTab === 'Create User' || activeTab === 'Users List') && styles.navItemActive]}
                  onPress={() => { setIsSidebarCollapsed(false); setUsersExpanded(true); }}
                  activeOpacity={0.7}>
                  <UserPlus size={16} color={(activeTab === 'Create User' || activeTab === 'Users List') ? '#111827' : '#6b7280'} />
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={styles.navGroupRow} onPress={() => setUsersExpanded(prev => !prev)} activeOpacity={0.7}>
                    <View style={styles.navIcon}><UserPlus size={16} color="#6b7280" /></View>
                    <Text style={styles.navGroupLabel}>Users</Text>
                    {usersExpanded ? <Minus size={14} color="#9ca3af" /> : <Plus size={14} color="#9ca3af" />}
                  </TouchableOpacity>
                  {usersExpanded && (
                    <View style={styles.subNavItems}>
                      <TouchableOpacity style={[styles.subNavItem, activeTab === 'Create User' && styles.subNavItemActive]} onPress={() => { setActiveTab('Create User'); if (!isDesktop) setIsSidebarOpen(false); }}>
                        <Text style={[styles.subNavLabel, activeTab === 'Create User' && styles.subNavLabelActive]}>Create User</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.subNavItem, activeTab === 'Users List' && styles.subNavItemActive]} onPress={() => { setActiveTab('Users List'); if (!isDesktop) setIsSidebarOpen(false); }}>
                        <Text style={[styles.subNavLabel, activeTab === 'Users List' && styles.subNavLabelActive]}>Users</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* ── Footer ── */}
            <View style={[styles.sidebarFooter, isSidebarCollapsed && styles.sidebarFooterCollapsed]}>
              {showLogout && (
                isSidebarCollapsed ? (
                  <TouchableOpacity
                    style={styles.logoutIconBtn}
                    onPress={async () => { setShowLogout(false); await logout(); }}
                    activeOpacity={0.85}>
                    <XCircle size={18} color="#ef4444" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.logoutPopover}
                    onPress={async () => { setShowLogout(false); await logout(); }}
                    activeOpacity={0.85}>
                    <XCircle size={14} color="#ef4444" />
                    <Text style={styles.logoutPopoverText}>Logout</Text>
                  </TouchableOpacity>
                )
              )}
              <TouchableOpacity
                style={[styles.userProfile, isSidebarCollapsed && styles.userProfileCollapsed]}
                onPress={() => setShowLogout(prev => !prev)}
                activeOpacity={0.8}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarInitial}>{(user?.email?.[0] ?? 'A').toUpperCase()}</Text>
                </View>
                {!isSidebarCollapsed && (
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName} numberOfLines={1}>{user?.email ?? 'Admin User'}</Text>
                    <Text style={styles.userRole}>{user?.userType ?? 'Super Admin'}</Text>
                  </View>
                )}
              </TouchableOpacity>
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
                <StatCard label="Total Employees" value={employees.length.toString()} trend="+12.5%" icon={<Users color="#7c3aed" />} color="#f5f3ff" />
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
          ) : activeTab === 'Create Employee' ? (
            <EmployeesView
              employees={employees}
              onAddPress={() => { setEditingGuard(null); setIsModalVisible(true); }}
              onViewDetails={(guard: any) => { setSelectedGuard(guard); setIsDetailsVisible(true); }}
            />
          ) : activeTab === 'Employees List' ? (
            <EmployeesListView />
          ) : activeTab === 'Create User' ? (
            <CreateUserView />
          ) : activeTab === 'Users List' ? (
            <UsersListView companyCode={user?.companyCode} />
          ) : activeTab === 'Vendor' ? (
            <VendorView />
          ) : activeTab === 'Stocks' ? (
            <StocksView />
          ) : activeTab === 'Create Order' ? (
            <CreateOrderView />
          ) : activeTab === 'Order Placed' ? (
            <OrderPlacedView />
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
              setEmployees(employees.map(g => g.id === editingGuard.id ? { ...g, ...guardData, name: guardData.fullName, station: guardData.assignedSite } : g));
            } else {
              const id = `GD-${Math.floor(1000 + Math.random() * 9000)}`;
              setEmployees([...employees, { id, ...guardData, name: guardData.fullName, station: guardData.assignedSite || 'Unassigned', status: 'On Duty', joined: 'Mar 2026' }]);
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
    <TouchableOpacity style={[styles.navItem, active && styles.navItemActive]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.navIcon}>{React.cloneElement(icon, { color: active ? '#111827' : '#6b7280' })}</View>
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

function EmployeesView({ employees, onAddPress, onViewDetails }: { employees: any[], onAddPress: () => void, onViewDetails: (guard: any) => void }) {
  return (
    <View style={styles.employeesView}>
      <View style={styles.employeesHeader}>
        <View>
          <Text style={styles.employeesTitle}>Employee Roster</Text>
          <Text style={styles.employeesSubtitle}>Manage and monitor your security team.</Text>
        </View>
        <TouchableOpacity style={styles.addEmployeeBtn} onPress={onAddPress}>
          <UserPlus size={20} color="#fff" />
          <Text style={styles.addEmployeeBtnText}>Register Employee</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.employeesGrid}>
        {employees.map((guard: any) => (
          <View key={guard.id} style={styles.employeeCard}>
            <View style={styles.employeeCardTop}>
              <View style={styles.employeeAvatar}><User size={24} color="#7c3aed" /></View>
              <View style={styles.employeeStatus}>
                <View style={[styles.statusDot, { backgroundColor: guard.status === 'On Duty' ? '#10b981' : '#f59e0b' }]} />
                <Text style={styles.employeeStatusText}>{guard.status}</Text>
              </View>
            </View>
            <View style={styles.employeeCardBody}>
              <Text style={styles.employeeName}>{guard.name}</Text>
              <Text style={styles.employeeId}>{guard.id}</Text>
              <View style={styles.employeeDetailRow}><MapPin size={14} color="#94a3b8" /><Text style={styles.employeeDetailText}>{guard.station}</Text></View>
              <View style={styles.employeeDetailRow}><ShieldCheck size={14} color="#94a3b8" /><Text style={styles.employeeDetailText}>Joined {guard.joined}</Text></View>
            </View>
            <View style={styles.employeeCardFooter}>
              <TouchableOpacity style={styles.employeeActionBtn} onPress={() => onViewDetails(guard)}>
                <Text style={styles.employeeActionText}>View Profile</Text>
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
    designation: '', grade: '',
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
  const [submitLoading, setSubmitLoading] = useState(false);
  const [empId, setEmpId] = useState<string | null>(null);

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

  const handleQuickSubmit = async () => {
    if (!formData.fullName || !formData.phone || !formData.designation || !formData.grade) {
      alert('Name, Phone, Designation and Grade are required.');
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await API.post('/api/employees', {
        name: formData.fullName,
        phone: formData.phone,
        designation: formData.designation,
        grade: formData.grade,
        dateOfJoining: new Date().toISOString().split('T')[0],
        formStatus: 'PENDING',
      });
      setEmpId(res.data.employeeId);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Failed to create employee.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
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
                    <FormInput label="Phone *" value={formData.phone} onChange={(v: string) => updateFormData('phone', v)} placeholder="+91 9XXXXXXXXX" />
                    <FormInput label="Designation *" value={formData.designation} onChange={(v: string) => updateFormData('designation', v)} placeholder="GUARD / OFFICER / ADMIN" />
                    <FormInput label="Grade *" value={formData.grade} onChange={(v: string) => updateFormData('grade', v)} placeholder="A / B / C" />
                    <FormInput label="Date of Birth *" value={formData.dob} onChange={(v: string) => updateFormData('dob', v)} placeholder="YYYY-MM-DD" />
                    <FormInput label="Gender" value={formData.gender} onChange={(v: string) => updateFormData('gender', v)} placeholder="Male / Female" />
                    <FormInput label="Nationality" value={formData.nationality} onChange={(v: string) => updateFormData('nationality', v)} placeholder="e.g. Indian" />
                    <FormInput label="Email *" value={formData.email} onChange={(v: string) => updateFormData('email', v)} placeholder="john@example.com" />
                    <FormInput label="Blood Group ⚠️" value={formData.bloodGroup} onChange={(v: string) => updateFormData('bloodGroup', v)} placeholder="O+" />
                    <FormInput label="Marital Status" value={formData.maritalStatus} onChange={(v: string) => updateFormData('maritalStatus', v)} placeholder="Married / Single" />
                  </View>
                  <TouchableOpacity style={styles.quickSubmitBtn} onPress={handleQuickSubmit} disabled={submitLoading} activeOpacity={0.85}>
                    {submitLoading
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={styles.quickSubmitBtnText}>⚡ Submit &amp; Get Employee ID</Text>}
                  </TouchableOpacity>
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

    {/* Employee ID success popup */}
    <Modal visible={!!empId} transparent animationType="fade" onRequestClose={() => setEmpId(null)}>
      <View style={styles.empIdOverlay}>
        <View style={styles.empIdCard}>
          <CheckCircle size={48} color="#10b981" />
          <Text style={styles.empIdTitle}>Employee Created!</Text>
          <Text style={styles.empIdSubtitle}>Your new employee ID is</Text>
          <View style={styles.empIdBadge}>
            <Text style={styles.empIdText}>{empId}</Text>
          </View>
          <TouchableOpacity style={styles.empIdDoneBtn} onPress={() => { setEmpId(null); onClose(); }}>
            <Text style={styles.empIdDoneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
  );
}

function GuardDetailsModal({ visible, guard, onClose, onEdit }: { visible: boolean, guard: any, onClose: () => void, onEdit: (guard: any) => void }) {
  if (!guard) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.detailsModal}>
          <View style={styles.detailsHeader}>
            <View>
              <Text style={styles.detailsTitle}>Guard Profile</Text>
              <Text style={styles.employeeId}>{guard.id}</Text>
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

// ─── UsersListView ────────────────────────────────────────────────────────────

function UsersListView({ companyCode }: { companyCode?: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await API.get('/api/users');
        setUsers(res.data);
      } catch (err: any) {
        const status = err?.response?.status;
        const msg = err?.response?.data?.message ?? err?.message ?? 'Unknown error';
        console.error('[UsersListView] fetch failed:', status, msg, err);
        setError(`Error ${status ?? ''}: ${msg}`);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [companyCode]);

  const statusColor = (status: string) =>
    status === 'ACTIVE' ? '#10b981' : status === 'INACTIVE' ? '#ef4444' : '#f59e0b';
  const statusBg = (status: string) =>
    status === 'ACTIVE' ? '#f0fdf4' : status === 'INACTIVE' ? '#fef2f2' : '#fffbeb';

  if (loading) return (
    <View style={styles.usersCenter}>
      <ActivityIndicator size="large" color="#7c3aed" />
    </View>
  );

  if (error) return (
    <View style={styles.usersCenter}>
      <Text style={styles.usersError}>{error}</Text>
    </View>
  );

  return (
    <View style={styles.usersContainer}>
      <View style={styles.usersHeader}>
        <Text style={styles.usersTitle}>Users</Text>
        <Text style={styles.usersSubtitle}>{users.length} user{users.length !== 1 ? 's' : ''} found</Text>
      </View>
      <ScrollView contentContainerStyle={styles.usersList}>
        {users.map((u: any) => (
          <View key={u.id} style={styles.userRow}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{u.name?.[0]?.toUpperCase() ?? '?'}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userNameText}>{u.name}</Text>
              <Text style={styles.userEmailText}>{u.email}</Text>
            </View>
            <View style={[styles.userStatusBadge, { backgroundColor: statusBg(u.status) }]}>
              <Text style={[styles.userStatusText, { color: statusColor(u.status) }]}>{u.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── EmployeesListView ────────────────────────────────────────────────────────

function EmployeesListView() {
  const [employees, setEmployeesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search by ID
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [formStatusFilter, setFormStatusFilter] = useState('ALL');
  const [designationFilter, setDesignationFilter] = useState('ALL');

  useEffect(() => {
    const params: Record<string, string> = {};
    if (statusFilter !== 'ALL') params.status = statusFilter;
    if (formStatusFilter !== 'ALL') params.formStatus = formStatusFilter;
    if (designationFilter !== 'ALL') params.designation = designationFilter;
    const qs = new URLSearchParams(params).toString();
    const query = qs ? `?${qs}` : '';

    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      setSearchResult(null);
      setSearchError(null);
      setSearchId('');
      try {
        const res = await API.get(`/api/employees${query}`);
        setEmployeesList(Array.isArray(res.data) ? res.data : res.data?.employees ?? []);
      } catch (err: any) {
        const st = err?.response?.status;
        const msg = err?.response?.data?.message ?? err?.message ?? 'Unknown error';
        setError(`Error ${st ?? ''}: ${msg}`);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [statusFilter, formStatusFilter, designationFilter]);

  const handleSearch = async () => {
    const id = searchId.trim();
    if (!id) { setSearchResult(null); setSearchError(null); return; }
    setSearchLoading(true);
    setSearchResult(null);
    setSearchError(null);
    try {
      const res = await API.get(`/api/employees/${id}`);
      setSearchResult(res.data);
    } catch (err: any) {
      const st = err?.response?.status;
      const msg = err?.response?.data?.message ?? err?.message ?? 'Not found';
      setSearchError(st === 404 ? 'Employee not found.' : `Error ${st}: ${msg}`);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => { setSearchId(''); setSearchResult(null); setSearchError(null); };

  const statusColor = (s: string) =>
    s === 'ACTIVE' ? '#10b981' : (s === 'INACTIVE' || s === 'TERMINATED') ? '#ef4444' : '#f59e0b';
  const statusBg = (s: string) =>
    s === 'ACTIVE' ? '#f0fdf4' : (s === 'INACTIVE' || s === 'TERMINATED') ? '#fef2f2' : '#fffbeb';

  const renderRow = (emp: any, idx: number) => (
    <View key={emp.id ?? emp.employeeId ?? idx} style={styles.userRow}>
      <View style={styles.userAvatar}>
        <Text style={styles.userAvatarText}>{emp.name?.[0]?.toUpperCase() ?? '?'}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userNameText}>{emp.name}</Text>
        <Text style={styles.userEmailText}>{emp.designation ?? emp.email ?? '—'}</Text>
        {(emp.employeeId || emp.id) && (
          <Text style={styles.empRowId}>ID: {emp.employeeId ?? emp.id}</Text>
        )}
      </View>
      <View style={[styles.userStatusBadge, { backgroundColor: statusBg(emp.status ?? emp.formStatus ?? '') }]}>
        <Text style={[styles.userStatusText, { color: statusColor(emp.status ?? emp.formStatus ?? '') }]}>
          {emp.status ?? emp.formStatus ?? 'N/A'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.usersContainer}>
      <View style={styles.usersHeader}>
        <Text style={styles.usersTitle}>Employees</Text>
        <Text style={styles.usersSubtitle}>{employees.length} employee{employees.length !== 1 ? 's' : ''} found</Text>
      </View>

      {/* ── Search by Employee ID ── */}
      <View style={styles.empSearchRow}>
        <Search size={16} color="#94a3b8" />
        <TextInput
          style={styles.empSearchInput}
          placeholder="Search by Employee ID…"
          placeholderTextColor="#94a3b8"
          value={searchId}
          onChangeText={setSearchId}
          onSubmitEditing={handleSearch}
        />
        {searchId.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.empSearchClear}>
            <XCircle size={16} color="#94a3b8" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.empSearchBtn} onPress={handleSearch}>
          {searchLoading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.empSearchBtnText}>Search</Text>}
        </TouchableOpacity>
      </View>

      {/* ── Filters ── */}
      <View style={styles.empFiltersSection}>
        <View style={styles.empFilterGroup}>
          <Text style={styles.empFilterLabel}>Status</Text>
          <View style={styles.empFilterPills}>
            {['ALL', 'ACTIVE', 'TERMINATED'].map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.empFilterPill, statusFilter === s && styles.empFilterPillActive]}
                onPress={() => setStatusFilter(s)}>
                <Text style={[styles.empFilterPillText, statusFilter === s && styles.empFilterPillTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.empFilterGroup}>
          <Text style={styles.empFilterLabel}>Form Status</Text>
          <View style={styles.empFilterPills}>
            {['ALL', 'PENDING', 'COMPLETED'].map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.empFilterPill, formStatusFilter === s && styles.empFilterPillActive]}
                onPress={() => setFormStatusFilter(s)}>
                <Text style={[styles.empFilterPillText, formStatusFilter === s && styles.empFilterPillTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.empFilterGroup}>
          <Text style={styles.empFilterLabel}>Designation</Text>
          <View style={styles.empFilterPills}>
            {['ALL', 'GUARD'].map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.empFilterPill, designationFilter === s && styles.empFilterPillActive]}
                onPress={() => setDesignationFilter(s)}>
                <Text style={[styles.empFilterPillText, designationFilter === s && styles.empFilterPillTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* ── Search result ── */}
      {searchResult && (
        <View style={styles.empSearchResultCard}>
          <Text style={styles.empSearchResultTitle}>Search Result</Text>
          {renderRow(searchResult, 0)}
        </View>
      )}
      {searchError && (
        <View style={styles.empSearchErrorBox}>
          <Text style={styles.empSearchErrorText}>{searchError}</Text>
        </View>
      )}

      {/* ── Employee list ── */}
      {!searchResult && (
        loading ? (
          <View style={styles.usersCenter}>
            <ActivityIndicator size="large" color="#7c3aed" />
          </View>
        ) : error ? (
          <View style={styles.usersCenter}>
            <Text style={styles.usersError}>{error}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.usersList}>
            {employees.length === 0 ? (
              <View style={styles.usersCenter}>
                <Text style={styles.usersError}>No employees found for selected filters.</Text>
              </View>
            ) : employees.map((emp, idx) => renderRow(emp, idx))}
          </ScrollView>
        )
      )}
    </View>
  );
}

// ─── VendorView ───────────────────────────────────────────────────────────────

function VendorView() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStepper, setShowStepper] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = Platform.OS === 'web'
        ? localStorage.getItem('accessToken')
        : await AsyncStorage.getItem('accessToken');
      const res = await axios.get('http://localhost:8080/api/vendors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const handleVendorSubmit = (_data: VendorFormData) => { fetchVendors(); };

  const statusColor = (s: string) => {
    if (s === 'ACTIVE') return '#10b981';
    if (s === 'PENDING_APPROVAL') return '#f59e0b';
    if (s === 'INACTIVE') return '#ef4444';
    return '#64748b';
  };
  const statusBg = (s: string) => {
    if (s === 'ACTIVE') return '#f0fdf4';
    if (s === 'PENDING_APPROVAL') return '#fffbeb';
    if (s === 'INACTIVE') return '#fef2f2';
    return '#f8fafc';
  };
  const statusLabel = (s: string) => s.replace(/_/g, ' ');

  return (
    <View style={styles.vendorContainer}>
      {/* Header */}
      <View style={styles.vendorHeader}>
        <View>
          <Text style={styles.vendorTitle}>Vendors</Text>
          <Text style={styles.vendorSubtitle}>Manage your supplier and vendor directory.</Text>
        </View>
        <TouchableOpacity style={styles.vendorAddBtn} onPress={() => setShowStepper(true)} activeOpacity={0.85}>
          <Store size={18} color="#fff" />
          <Text style={styles.vendorAddBtnText}>Add Vendor</Text>
        </TouchableOpacity>
      </View>

      {/* Table */}
      {loading ? (
        <View style={styles.vendorEmptyBox}>
          <ActivityIndicator color="#7c3aed" size="large" />
          <Text style={styles.vendorEmptyText}>Loading vendors…</Text>
        </View>
      ) : error ? (
        <View style={styles.vendorEmptyBox}>
          <Text style={[styles.vendorEmptyText, { color: '#ef4444' }]}>{error}</Text>
          <TouchableOpacity style={styles.vendorAddBtn} onPress={fetchVendors} activeOpacity={0.85}>
            <Text style={styles.vendorAddBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : vendors.length === 0 ? (
        <View style={styles.vendorEmptyBox}>
          <Store size={40} color="#cbd5e1" />
          <Text style={styles.vendorEmptyText}>No vendors yet</Text>
          <Text style={styles.vendorEmptySubText}>Add your first vendor using the button above.</Text>
        </View>
      ) : (
        <View style={styles.vendorTableWrap}>
          {/* Table header */}
          <View style={styles.vendorTableHeader}>
            <Text style={[styles.vendorTH, { flex: 1.2 }]}>Type</Text>
            <Text style={[styles.vendorTH, { flex: 2.5 }]}>Legal Name</Text>
            <Text style={[styles.vendorTH, { flex: 2 }]}>Trade Name</Text>
            <Text style={[styles.vendorTH, { flex: 1.8 }]}>GSTIN</Text>
            <Text style={[styles.vendorTH, { flex: 1.4 }]}>PAN</Text>
            <Text style={[styles.vendorTH, { flex: 1.5 }]}>Status</Text>
            <Text style={[styles.vendorTH, { flex: 1, textAlign: 'right' }]}> </Text>
          </View>

          {vendors.map((v, idx) => (
            <View key={v.id} style={[styles.vendorTR, idx % 2 === 1 && styles.vendorTRAlt]}>
              <Text style={[styles.vendorTD, { flex: 1.2 }]} numberOfLines={1}>
                {v.vendorType?.replace(/_/g, ' ')}
              </Text>
              <Text style={[styles.vendorTD, styles.vendorTDStrong, { flex: 2.5 }]} numberOfLines={1}>
                {v.legalCompanyName}
              </Text>
              <Text style={[styles.vendorTD, { flex: 2 }]} numberOfLines={1}>
                {v.tradeName || '—'}
              </Text>
              <Text style={[styles.vendorTD, styles.vendorTDMono, { flex: 1.8 }]} numberOfLines={1}>
                {v.gstin}
              </Text>
              <Text style={[styles.vendorTD, styles.vendorTDMono, { flex: 1.4 }]} numberOfLines={1}>
                {v.pan}
              </Text>
              <View style={{ flex: 1.5 }}>
                <View style={[styles.vendorStatusBadge, { backgroundColor: statusBg(v.status) }]}>
                  <Text style={[styles.vendorStatusText, { color: statusColor(v.status) }]}>
                    {statusLabel(v.status)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.vendorDetailsBtn, { flex: 1 }]}
                onPress={() => setSelected(v)}
                activeOpacity={0.8}
              >
                <Text style={styles.vendorDetailsBtnText}>Details</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Detail modal */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.stockDetailOverlay}>
          <View style={[styles.stockDetailModal, { width: isWeb ? 620 : width - 24 }]}>
            <View style={styles.stockDetailHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.stockDetailTitle}>{selected?.legalCompanyName}</Text>
                <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                  {selected?.vendorType?.replace(/_/g, ' ')}
                  {selected?.tradeName ? ` · ${selected.tradeName}` : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelected(null)} hitSlop={8}
                style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: isWeb ? 520 : '80%' }}>
              {/* Business */}
              <View style={styles.vendorDetailSection}>
                <Text style={styles.vendorDetailSectionTitle}>Business Information</Text>
                {[
                  ['GSTIN', selected?.gstin],
                  ['PAN', selected?.pan],
                  ['MSME Number', selected?.msmeNumber],
                  ['Address', [selected?.registeredAddress, selected?.city, selected?.state].filter(Boolean).join(', ')],
                  ['Pincode', selected?.pincode],
                  ['Status', selected?.status?.replace(/_/g, ' ')],
                  ['Payment Terms', selected?.paymentTerms?.replace(/_/g, ' ')],
                ].map(([label, value]) => value ? (
                  <View key={label as string} style={styles.stockDetailRow}>
                    <Text style={styles.stockDetailLabel}>{label}</Text>
                    <Text style={styles.stockDetailValue}>{value as string}</Text>
                  </View>
                ) : null)}
              </View>

              {/* Contact */}
              <View style={styles.vendorDetailSection}>
                <Text style={styles.vendorDetailSectionTitle}>Contact Details</Text>
                {[
                  ['Name', selected?.contactPersonName],
                  ['Mobile', selected?.contactPersonMobile],
                  ['Email', selected?.contactPersonEmail],
                  ['Landline', selected?.companyLandline],
                ].map(([label, value]) => value ? (
                  <View key={label as string} style={styles.stockDetailRow}>
                    <Text style={styles.stockDetailLabel}>{label}</Text>
                    <Text style={styles.stockDetailValue}>{value as string}</Text>
                  </View>
                ) : null)}
              </View>

              {/* Banking */}
              <View style={styles.vendorDetailSection}>
                <Text style={styles.vendorDetailSectionTitle}>Banking</Text>
                {[
                  ['Account Number', selected?.bankAccountNumber],
                  ['IFSC Code', selected?.ifscCode],
                  ['Beneficiary', selected?.beneficiaryName],
                ].map(([label, value]) => value ? (
                  <View key={label as string} style={styles.stockDetailRow}>
                    <Text style={styles.stockDetailLabel}>{label}</Text>
                    <Text style={styles.stockDetailValue}>{value as string}</Text>
                  </View>
                ) : null)}
              </View>

              {/* Products */}
              {selected?.products?.length > 0 && (
                <View style={styles.vendorDetailSection}>
                  <Text style={styles.vendorDetailSectionTitle}>Products ({selected.products.length})</Text>
                  <View style={styles.vendorProdTableHeader}>
                    <Text style={[styles.vendorProdTH, { flex: 2.5 }]}>Product</Text>
                    <Text style={[styles.vendorProdTH, { flex: 1.5 }]}>Category</Text>
                    <Text style={[styles.vendorProdTH, { flex: 1.2, textAlign: 'right' }]}>Price</Text>
                    <Text style={[styles.vendorProdTH, { flex: 0.8, textAlign: 'right' }]}>Unit</Text>
                  </View>
                  {selected.products.map((p: any) => (
                    <View key={p.id} style={styles.vendorProdRow}>
                      <View style={{ flex: 2.5 }}>
                        <Text style={styles.vendorProdName} numberOfLines={1}>{p.productName}</Text>
                        {p.description ? <Text style={styles.vendorProdDesc} numberOfLines={1}>{p.description}</Text> : null}
                      </View>
                      <Text style={[styles.vendorProdTD, { flex: 1.5 }]} numberOfLines={1}>
                        {p.productCategory?.replace(/_/g, ' ')}
                      </Text>
                      <Text style={[styles.vendorProdTD, styles.vendorProdPrice, { flex: 1.2 }]}>
                        ₹{Number(p.unitPrice).toLocaleString('en-IN')}
                      </Text>
                      <Text style={[styles.vendorProdTD, { flex: 0.8, textAlign: 'right' }]}>
                        {p.unit}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <AddVendorStepper
        visible={showStepper}
        onClose={() => setShowStepper(false)}
        onSubmit={handleVendorSubmit}
      />
    </View>
  );
}

// ─── StocksView ───────────────────────────────────────────────────────────────

function CreateOrderView() {
  const [open, setOpen] = useState(true);
  return (
    <View style={styles.stocksContainer}>
      <View style={styles.stocksHeader}>
        <View>
          <Text style={styles.stocksTitle}>Create Order</Text>
          <Text style={styles.stocksSubtitle}>Place a new purchase order from your vendors.</Text>
        </View>
        <TouchableOpacity style={styles.stocksOrderBtn} onPress={() => setOpen(true)} activeOpacity={0.85}>
          <Plus size={15} color="#fff" />
          <Text style={styles.stocksOrderBtnText}>New Order</Text>
        </TouchableOpacity>
      </View>
      {!open && (
        <View style={[styles.stocksEmptyBox, { marginTop: 40 }]}>
          <Package size={40} color="#cbd5e1" />
          <Text style={styles.stocksEmptyText}>No open order</Text>
          <Text style={{ fontSize: 13, color: '#94a3b8' }}>Tap "New Order" to create a purchase order.</Text>
        </View>
      )}
      <CreateOrderStepper visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}

function OrderPlacedView() {
  return (
    <View style={styles.stocksContainer}>
      <View style={styles.stocksHeader}>
        <View>
          <Text style={styles.stocksTitle}>Orders Placed</Text>
          <Text style={styles.stocksSubtitle}>History of all purchase orders.</Text>
        </View>
      </View>
      <View style={[styles.stocksEmptyBox, { marginTop: 40 }]}>
        <Package size={40} color="#cbd5e1" />
        <Text style={styles.stocksEmptyText}>No orders yet</Text>
        <Text style={{ fontSize: 13, color: '#94a3b8' }}>Placed orders will appear here.</Text>
      </View>
    </View>
  );
}

function StocksView() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<any | null>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = Platform.OS === 'web'
          ? localStorage.getItem('accessToken')
          : await AsyncStorage.getItem('accessToken');
        const res = await axios.get('http://localhost:8080/api/stock/items', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStocks(Array.isArray(res.data) ? res.data : res.data?.items ?? []);
      } catch (err: any) {
        const st = err?.response?.status;
        const msg = err?.response?.data?.message ?? err?.message ?? 'Unknown error';
        setError(`Error ${st ?? ''}: ${msg}`);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  const levelColor = (lowStock: boolean, qty: number, minQty: number) => {
    if (lowStock || qty <= minQty) return '#ef4444';
    if (qty <= minQty * 2) return '#f59e0b';
    return '#10b981';
  };
  const levelBg = (lowStock: boolean, qty: number, minQty: number) => {
    if (lowStock || qty <= minQty) return '#fef2f2';
    if (qty <= minQty * 2) return '#fffbeb';
    return '#f0fdf4';
  };
  const levelLabel = (lowStock: boolean, qty: number, minQty: number) => {
    if (lowStock || qty <= minQty) return 'Critical';
    if (qty <= minQty * 2) return 'Low';
    return 'Good';
  };

  return (
    <View style={styles.stocksContainer}>
      <View style={styles.stocksHeader}>
        <View>
          <Text style={styles.stocksTitle}>Stocks</Text>
          <Text style={styles.stocksSubtitle}>Track inventory and equipment levels.</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.usersCenter}><ActivityIndicator size="large" color="#0ea5e9" /></View>
      ) : error ? (
        <View style={styles.usersCenter}><Text style={styles.usersError}>{error}</Text></View>
      ) : (
        <View style={styles.stocksTable}>
          <View style={styles.stocksTableHeader}>
            <Text style={[styles.stocksTableHeaderCell, { flex: 2 }]}>Name</Text>
            <Text style={styles.stocksTableHeaderCell}>Category</Text>
            <Text style={styles.stocksTableHeaderCell}>Size</Text>
            <Text style={styles.stocksTableHeaderCell}>Unit</Text>
            <Text style={styles.stocksTableHeaderCell}>Qty</Text>
            <Text style={[styles.stocksTableHeaderCell, { flex: 1.2 }]}>Stock</Text>
            <Text style={[styles.stocksTableHeaderCell, { flex: 1.2 }]}></Text>
          </View>
          {stocks.length === 0 ? (
            <View style={styles.stocksEmptyBox}>
              <Package size={36} color="#cbd5e1" />
              <Text style={styles.stocksEmptyText}>No stock items found</Text>
            </View>
          ) : stocks.map((s: any) => (
            <View key={s.id} style={styles.stocksTableRow}>
              <View style={{ flex: 2 }}>
                <Text style={styles.stocksTableCellBold} numberOfLines={1}>{s.name}</Text>
                {s.vendorName && <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }} numberOfLines={1}>{s.vendorName}</Text>}
              </View>
              <Text style={styles.stocksTableCell}>{s.category}</Text>
              <Text style={styles.stocksTableCell}>{s.size ?? '—'}</Text>
              <Text style={styles.stocksTableCell}>{s.unit}</Text>
              <Text style={styles.stocksTableCellBold}>{s.currentQty}</Text>
              <View style={{ flex: 1.2 }}>
                <View style={[styles.stocksLevelBadge, { backgroundColor: levelBg(s.lowStock, s.currentQty, s.minQty) }]}>
                  <Text style={[styles.stocksLevelText, { color: levelColor(s.lowStock, s.currentQty, s.minQty) }]}>
                    {levelLabel(s.lowStock, s.currentQty, s.minQty)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.stocksMoreBtn, { flex: 1.2 }]}
                onPress={() => setSelectedStock(s)}
                activeOpacity={0.8}>
                <Text style={styles.stocksMoreBtnText}>Details</Text>
                <ChevronRight size={12} color="#0ea5e9" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* ── Detail Modal ── */}
      <Modal visible={!!selectedStock} transparent animationType="fade" onRequestClose={() => setSelectedStock(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.stockDetailModal}>
            <View style={styles.stockDetailHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.stockDetailTitle}>{selectedStock?.name}</Text>
                <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{selectedStock?.id}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedStock(null)}>
                <XCircle size={26} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 440 }} contentContainerStyle={{ gap: 2 }}>
              {[
                ['Category', selectedStock?.category],
                ['Size', selectedStock?.size ?? '—'],
                ['Unit', selectedStock?.unit],
                ['Current Qty', selectedStock?.currentQty],
                ['Min Qty', selectedStock?.minQty],
                ['Unit Price', selectedStock?.unitPrice != null ? `₹${selectedStock.unitPrice}` : '—'],
                ['Vendor', selectedStock?.vendorName ?? '—'],
                ['Status', selectedStock?.status],
                ['Low Stock', selectedStock?.lowStock ? 'Yes' : 'No'],
                ['Created At', selectedStock?.createdAt ? new Date(selectedStock.createdAt).toLocaleString() : '—'],
                ['Updated At', selectedStock?.updatedAt ? new Date(selectedStock.updatedAt).toLocaleString() : '—'],
              ].map(([label, value]) => (
                <View key={label as string} style={styles.stockDetailRow}>
                  <Text style={styles.stockDetailLabel}>{label}</Text>
                  <Text style={styles.stockDetailValue}>{String(value ?? '—')}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── CreateUserView ───────────────────────────────────────────────────────────

type UserType = 'ADMIN' | 'OFFICER' | 'GUARD';
const USER_TYPES: UserType[] = ['ADMIN', 'OFFICER', 'GUARD'];

function CreateUserView() {
  const blankForm = { name: '', email: '', password: '', phone: '', companyCode: '', userType: 'OFFICER' as UserType };
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    const { name, email, password, phone, companyCode } = form;
    if (!name || !email || !password || !phone || !companyCode) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/auth/create/user', form);
      setSuccess(`User "${res.data.name}" created successfully!`);
      setForm(blankForm);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.createUserContainer}>
      <View style={styles.createUserCard}>
        <Text style={styles.createUserTitle}>Create New User</Text>
        <Text style={styles.createUserSubtitle}>Add a new admin, officer, or guard to the system.</Text>

        <View style={styles.createUserGrid}>
          <CreateUserField label="Full Name" value={form.name} onChangeText={set('name')} placeholder="e.g. Ray Sharma" />
          <CreateUserField label="Email" value={form.email} onChangeText={set('email')} placeholder="e.g. ray@shield.com" keyboardType="email-address" autoCapitalize="none" />
          <CreateUserField label="Password" value={form.password} onChangeText={set('password')} placeholder="Password" secureTextEntry />
          <CreateUserField label="Phone" value={form.phone} onChangeText={set('phone')} placeholder="e.g. 9999999999" keyboardType="phone-pad" />
          <CreateUserField label="Company Code" value={form.companyCode} onChangeText={set('companyCode')} placeholder="e.g. REENA" autoCapitalize="characters" />
        </View>

        <Text style={styles.createUserLabel}>User Type</Text>
        <View style={styles.createUserSegment}>
          {USER_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.segmentBtn, form.userType === type && styles.segmentBtnActive]}
              onPress={() => setForm(prev => ({ ...prev, userType: type }))}>
              <Text style={[styles.segmentBtnText, form.userType === type && styles.segmentBtnTextActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <View style={styles.alertError}><Text style={styles.alertErrorText}>{error}</Text></View> : null}
        {success ? <View style={styles.alertSuccess}><Text style={styles.alertSuccessText}>{success}</Text></View> : null}

        <TouchableOpacity style={styles.createUserBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.createUserBtnText}>Create User</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CreateUserField({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.createUserFieldWrapper}>
      <Text style={styles.createUserLabel}>{label}</Text>
      <TextInput style={styles.createUserInput} placeholderTextColor="#94a3b8" {...props} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Layout
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#f8fafc' },
  sidebar: { width: 248, backgroundColor: '#fafafa', borderRightWidth: 1, borderRightColor: '#e5e7eb', zIndex: 1000 },
  sidebarCollapsed: { width: 56 },
  sidebarContent: { flex: 1, paddingHorizontal: 12, paddingVertical: 20 },
  sidebarContentCollapsed: { paddingHorizontal: 8, alignItems: 'center' },
  mobileSidebar: { position: 'absolute', left: 0, top: 0, bottom: 0, shadowColor: '#000', shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 12 },
  overlay: { position: 'absolute', left: 260, top: 0, bottom: 0, width: width, backgroundColor: 'rgba(0,0,0,0.25)' },
  sidebarHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, gap: 8, paddingHorizontal: 4 },
  sidebarHeaderCollapsed: { flexDirection: 'column', alignItems: 'center', gap: 10, paddingHorizontal: 0 },
  brandName: { fontSize: 15, fontWeight: '700', color: '#111827', flex: 1 },
  collapseSidebarBtn: { padding: 4, borderRadius: 6 },
  navItems: { flex: 1, gap: 2, alignSelf: 'stretch' },
  navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 10, borderRadius: 8, gap: 10 },
  navItemActive: { backgroundColor: '#f3f4f6' },
  navItemCollapsed: { justifyContent: 'center', paddingHorizontal: 0, width: 36, alignSelf: 'center' },
  navGroupRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 10, borderRadius: 8, gap: 10 },
  navGroupLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#374151' },
  navIcon: { width: 20, alignItems: 'center' },
  navIconActive: { color: '#111827' },
  navLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#374151' },
  navLabelActive: { color: '#111827', fontWeight: '600' },
  sidebarFooter: { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 16, gap: 6, alignSelf: 'stretch' },
  sidebarFooterCollapsed: { alignItems: 'center' },
  userProfile: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 8 },
  userProfileCollapsed: { justifyContent: 'center', padding: 4 },
  logoutPopover: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  logoutPopoverText: { color: '#ef4444', fontWeight: '600', fontSize: 13 },
  logoutIconBtn: { alignItems: 'center', padding: 8 },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e0e7ff', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 12, fontWeight: '700', color: '#4f46e5' },
  userName: { fontSize: 13, fontWeight: '600', color: '#111827' },
  userRole: { fontSize: 11, color: '#9ca3af', marginTop: 1 },

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

  // Employees view
  employeesView: { flex: 1 },
  employeesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  employeesTitle: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  employeesSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  addEmployeeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7c3aed', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 8 },
  addEmployeeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  employeesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  employeeCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', minWidth: isWeb ? 280 : width - 48, flexGrow: 1 },
  employeeCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  employeeAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f5f3ff', justifyContent: 'center', alignItems: 'center' },
  employeeStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  employeeStatusText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  employeeCardBody: { marginBottom: 16, gap: 6 },
  employeeName: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  employeeId: { fontSize: 13, color: '#94a3b8', marginBottom: 8 },
  employeeDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  employeeDetailText: { fontSize: 13, color: '#64748b' },
  employeeCardFooter: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
  employeeActionBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  employeeActionText: { fontSize: 14, fontWeight: '600', color: '#7c3aed' },
  placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Create User View
  createUserContainer: { flex: 1, alignItems: isWeb ? 'center' : 'stretch' },
  createUserCard: { backgroundColor: '#fff', borderRadius: 24, padding: 32, borderWidth: 1, borderColor: '#e2e8f0', width: isWeb ? 600 : '100%' },
  createUserTitle: { fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
  createUserSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 28 },
  createUserGrid: { gap: 4, marginBottom: 20 },
  createUserFieldWrapper: { marginBottom: 16 },
  createUserLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 6 },
  createUserInput: { backgroundColor: '#f8fafc', color: '#1e293b', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  createUserSegment: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', backgroundColor: '#f8fafc' },
  segmentBtnActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  segmentBtnText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  segmentBtnTextActive: { color: '#fff' },
  alertError: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 16 },
  alertErrorText: { color: '#ef4444', fontSize: 13 },
  alertSuccess: { backgroundColor: '#f0fdf4', borderRadius: 10, padding: 12, marginBottom: 16 },
  alertSuccessText: { color: '#10b981', fontSize: 13 },
  createUserBtn: { backgroundColor: '#7c3aed', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  createUserBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Sub-nav
  subNavItems: { marginLeft: 10, marginTop: 2, gap: 1, paddingLeft: 16, borderLeftWidth: 1, borderLeftColor: '#e5e7eb' },
  subNavItem: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  subNavItemActive: { backgroundColor: '#f3f4f6' },
  subNavLabel: { fontSize: 13, color: '#6b7280', fontWeight: '400' },
  subNavLabelActive: { color: '#111827', fontWeight: '600' },

  // Users list
  usersContainer: { flex: 1 },
  usersHeader: { marginBottom: 20 },
  usersTitle: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
  usersSubtitle: { fontSize: 14, color: '#64748b', marginTop: 2 },
  usersList: { gap: 10 },
  usersCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  usersError: { color: '#ef4444', fontSize: 14, textAlign: 'center' },
  userRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', gap: 14 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ede9fe', justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { fontSize: 18, fontWeight: '700', color: '#7c3aed' },
  userInfo: { flex: 1 },
  userNameText: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  userEmailText: { fontSize: 13, color: '#64748b', marginTop: 2 },
  userStatusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  userStatusText: { fontSize: 12, fontWeight: '700' },

  // Employee list search & filters
  empSearchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 14, paddingVertical: 6 },
  empSearchInput: { flex: 1, fontSize: 14, color: '#1e293b', paddingVertical: 8 },
  empSearchClear: { padding: 2 },
  empSearchBtn: { backgroundColor: '#7c3aed', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  empSearchBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  empFiltersSection: { gap: 10, marginBottom: 18 },
  empFilterGroup: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  empFilterLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', minWidth: 90 },
  empFilterPills: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  empFilterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  empFilterPillActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  empFilterPillText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  empFilterPillTextActive: { color: '#fff' },
  empSearchResultCard: { backgroundColor: '#f5f3ff', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#ddd6fe' },
  empSearchResultTitle: { fontSize: 12, fontWeight: '700', color: '#7c3aed', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  empSearchErrorBox: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 16 },
  empSearchErrorText: { color: '#ef4444', fontSize: 13 },
  empRowId: { fontSize: 11, color: '#94a3b8', marginTop: 2 },

  // Vendor view
  vendorContainer: { flex: 1 },
  vendorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  vendorTitle: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  vendorSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  vendorAddBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7c3aed', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 8 },
  vendorAddBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  vendorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  vendorCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', minWidth: isWeb ? 280 : width - 48, flexGrow: 1 },
  vendorCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  vendorAvatarBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  vendorCardName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  vendorCardCategory: { fontSize: 12, color: '#64748b', marginTop: 2 },
  vendorCardRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  vendorCardRowText: { fontSize: 13, color: '#64748b' },
  vendorBadge: { alignSelf: 'flex-start', marginTop: 12, paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1 },
  vendorBadgeText: { fontSize: 11, fontWeight: '700' },
  vendorEmptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80, gap: 10 },
  vendorEmptyText: { fontSize: 16, color: '#94a3b8', fontWeight: '600' },
  vendorEmptySubText: { fontSize: 13, color: '#cbd5e1' },

  // Vendor table
  vendorTableWrap: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  vendorTableHeader: { flexDirection: 'row', backgroundColor: '#f8fafc', paddingVertical: 11, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  vendorTH: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  vendorTR: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  vendorTRAlt: { backgroundColor: '#fafafa' },
  vendorTD: { fontSize: 13, color: '#374151' },
  vendorTDStrong: { fontWeight: '700', color: '#1e293b' },
  vendorTDMono: { fontFamily: isWeb ? 'monospace' : undefined, fontSize: 12, color: '#64748b' },
  vendorStatusBadge: { alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  vendorStatusText: { fontSize: 11, fontWeight: '700' },
  vendorDetailsBtn: { alignItems: 'flex-end' },
  vendorDetailsBtnText: { fontSize: 12, fontWeight: '700', color: '#7c3aed' },

  // Vendor detail modal sections
  vendorDetailSection: { marginBottom: 4 },
  vendorDetailSectionTitle: { fontSize: 11, fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.7, backgroundColor: '#fafafa', paddingHorizontal: 22, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  vendorProdTableHeader: { flexDirection: 'row', paddingHorizontal: 22, paddingVertical: 8, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  vendorProdTH: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  vendorProdRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  vendorProdName: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  vendorProdDesc: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  vendorProdTD: { fontSize: 12, color: '#64748b' },
  vendorProdPrice: { fontWeight: '700', color: '#10b981', textAlign: 'right' },

  // Stocks view
  stocksContainer: { flex: 1 },
  stocksHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  stocksTitle: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  stocksSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  stocksAddBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0ea5e9', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 8 },
  stocksAddBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  stocksOrderBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#6366f1', paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12 },
  stocksOrderBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  stocksTable: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  stocksTableHeader: { flexDirection: 'row', backgroundColor: '#f8fafc', paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  stocksTableHeaderCell: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', flex: 1 },
  stocksTableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  stocksTableCell: { fontSize: 13, color: '#374151', flex: 1 },
  stocksTableCellBold: { fontSize: 13, fontWeight: '700', color: '#1e293b', flex: 1 },
  stocksLevelBadge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20, alignSelf: 'flex-start' },
  stocksLevelText: { fontSize: 11, fontWeight: '700' },
  stocksEmptyBox: { justifyContent: 'center', alignItems: 'center', paddingVertical: 60, gap: 10 },
  stocksEmptyText: { fontSize: 16, color: '#94a3b8', fontWeight: '600' },
  stocksMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, justifyContent: 'flex-end' },
  stocksMoreBtnText: { fontSize: 12, fontWeight: '600', color: '#0ea5e9' },
  stockDetailOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'center', alignItems: 'center' },
  stockDetailModal: { width: isWeb ? 500 : width - 32, maxHeight: '85%', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  stockDetailHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: 22, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  stockDetailTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  stockDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, paddingHorizontal: 22, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  stockDetailLabel: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  stockDetailValue: { fontSize: 13, color: '#1e293b', fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 16 },
  quickSubmitBtn: { marginTop: 20, backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  quickSubmitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Employee ID popup
  empIdOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  empIdCard: { backgroundColor: '#fff', borderRadius: 24, padding: 36, alignItems: 'center', width: 320, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 10 },
  empIdTitle: { fontSize: 22, fontWeight: '800', color: '#1e293b', marginTop: 8 },
  empIdSubtitle: { fontSize: 14, color: '#64748b' },
  empIdBadge: { backgroundColor: '#f0fdf4', borderWidth: 1.5, borderColor: '#10b981', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginVertical: 4 },
  empIdText: { fontSize: 20, fontWeight: '800', color: '#10b981', letterSpacing: 1 },
  empIdDoneBtn: { backgroundColor: '#7c3aed', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12, marginTop: 8 },
  empIdDoneBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Modal overlay
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },

  // ── New horizontal stepper modal ──
  newMegaModal: { width: isWeb ? 900 : width - 16, maxHeight: isWeb ? 700 : '95%', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', flexDirection: 'column' },

  hStepperBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 14 },
  hStepperSteps: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  hStepItem: { flex: 1, alignItems: 'center', position: 'relative' },
  hConnector: { position: 'absolute', top: 14, right: '50%', left: '-50%', height: 2, backgroundColor: '#e2e8f0', zIndex: 0 },
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

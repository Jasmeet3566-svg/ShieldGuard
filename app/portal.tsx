import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LayoutDashboard, Users, Bell, Settings, ShieldAlert, CheckCircle, XCircle, Search, Menu, User, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function PortalScreen() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { width: windowWidth } = Dimensions.get('window');
  const isDesktop = windowWidth > 1024;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <View style={styles.container}>
      {/* Sidebar - Desktop or Mobile Drawer */}
      {(isDesktop || isSidebarOpen) && (
        <View style={[styles.sidebar, !isDesktop && styles.mobileSidebar]}>
          {/* Overlay for mobile */}
          {!isDesktop && (
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={() => setIsSidebarOpen(false)}
            />
          )}

          <View style={styles.sidebarContent}>
            <View style={styles.sidebarHeader}>
              <ShieldAlert color="#7c3aed" size={32} />
              <Text style={styles.brandName}>ShieldGuard</Text>
            </View>

            <View style={styles.navItems}>
              <NavItem
                icon={<LayoutDashboard size={20} />}
                label="Dashboard"
                active={activeTab === 'Dashboard'}
                onPress={() => { setActiveTab('Dashboard'); if (!isDesktop) setIsSidebarOpen(false); }}
              />
              <NavItem
                icon={<Users size={20} />}
                label="Guards"
                active={activeTab === 'Guards'}
                onPress={() => { setActiveTab('Guards'); if (!isDesktop) setIsSidebarOpen(false); }}
              />
              <NavItem
                icon={<Bell size={20} />}
                label="Alerts"
                active={activeTab === 'Alerts'}
                onPress={() => { setActiveTab('Alerts'); if (!isDesktop) setIsSidebarOpen(false); }}
              />
              <NavItem
                icon={<Settings size={20} />}
                label="Settings"
                active={activeTab === 'Settings'}
                onPress={() => { setActiveTab('Settings'); if (!isDesktop) setIsSidebarOpen(false); }}
              />
            </View>

            <View style={styles.sidebarFooter}>
              <View style={styles.userProfile}>
                <View style={styles.avatar}>
                  <User size={20} color="#64748b" />
                </View>
                <View>
                  <Text style={styles.userName}>Admin User</Text>
                  <Text style={styles.userRole}>Super Admin</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Main Content */}
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
          <View style={styles.statsGrid}>
            <StatCard label="Total Guards" value="1,284" trend="+12.5%" icon={<Users color="#7c3aed" />} color="#f5f3ff" />
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
                <TableRow id="#731" guard="Linda Evans" location="Sector 2" status="Critical" time="1 hr ago" />
              </View>
            </View>

            {isWeb && (
              <View style={styles.notifPanel}>
                <Text style={styles.sectionTitle}>Live Activity</Text>
                <NotificationItem sender="Isaiah Rivera" msg="started shift at Station B" time="2min ago" />
                <NotificationItem sender="Samuel Young" msg="reported suspicious activity" time="20min ago" />
                <NotificationItem sender="Christian Brooks" msg="completed checklist" time="1hr ago" />
                <NotificationItem sender="Levi Collins" msg="requested break" time="2hr ago" />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function NavItem({ icon, label, active, onPress }: any) {
  return (
    <TouchableOpacity
      style={[styles.navItem, active && styles.navItemActive]}
      onPress={onPress}
    >
      <View style={[styles.navIcon, active && styles.navIconActive]}>{icon}</View>
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatCard({ label, value, trend, icon, color }: any) {
  return (
    <Animated.View entering={FadeInRight.delay(200).duration(800)} style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color }]}>
        {icon}
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.statValueRow}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={[styles.statTrend, { color: trend.startsWith('+') ? '#10b981' : '#ef4444' }]}>
            {trend}
          </Text>
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
      <View style={styles.cellContainer}>
        <View style={styles.smallAvatar} />
        <Text style={styles.cellTextBold}>{guard}</Text>
      </View>
      <Text style={styles.cellText}>{location}</Text>
      <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
      </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
  },
  sidebar: {
    width: 260,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    zIndex: 1000,
  },
  sidebarContent: {
    flex: 1,
    padding: 24,
  },
  mobileSidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  overlay: {
    position: 'absolute',
    left: 260,
    top: 0,
    bottom: 0,
    width: width,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
    gap: 12,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
  },
  navItems: {
    flex: 1,
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  navItemActive: {
    backgroundColor: '#7c3aed',
  },
  navIcon: {
    color: '#64748b',
  },
  navIconActive: {
    color: '#fff',
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  navLabelActive: {
    color: '#fff',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 24,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  userRole: {
    fontSize: 12,
    color: '#64748b',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    height: 80,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  menuBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    width: 300,
    gap: 10,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  notificationBtn: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  scrollArea: {
    padding: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    minWidth: isWeb ? 240 : (width - 64) / 1, // Full width on mobile, grid on web
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexGrow: 1,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  statTrend: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentLayout: {
    flexDirection: 'row',
    gap: 32,
  },
  tableSection: {
    flex: 2,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  viewAll: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 16,
  },
  headerCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  cellContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  cellTextBold: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  cellText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notifPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignSelf: 'flex-start',
  },
  notifItem: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  notifAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
    color: '#1e293b',
  },
  notifTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
});

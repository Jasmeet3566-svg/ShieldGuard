import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { UserPlus, UserMinus, Shield, Users, LogIn, LogOut, ExternalLink } from 'lucide-react-native';
import { useAuth } from '@/hooks/use-auth';
import { useTeam, TeamUser } from '@/hooks/use-team';

/**
 * TeamScreen: Manage users and seat usage for a SaaS product.
 * Role-based access and seat limit logic are handled here.
 */
export default function TeamScreen() {
  const { user, isAdmin, login, logout, isLoading: authLoading } = useAuth();
  const { users, usedSeats, totalSeats, isLoading: teamLoading, addUser, removeUser, isAtLimit } = useTeam();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'User' });

  // Handle Loading States
  if (authLoading || teamLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Handle Restricted Access (Role-based)
  if (!user || (!isAdmin && user)) {
    return (
      <View style={styles.container}>
        {/* Header for role-switching during demo */}
        <View style={styles.header}>
          <Text style={styles.title}>Team Management</Text>
          <TouchableOpacity onPress={() => login('Admin')} style={styles.loginBtn}>
            <LogIn size={20} color="#007AFF" />
            <Text style={styles.loginBtnText}>Switch to Admin</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.restricted}>
          <Shield size={64} color="#FF3B30" />
          <Text style={styles.restrictedTitle}>Access Restricted</Text>
          <Text style={styles.restrictedText}>
            You must be an administrator to manage the team.
          </Text>
          {!user && (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => login()}>
              <Text style={styles.btnText}>Login as Admin</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Handle Adding User
  const handleAddUser = () => {
    if (isAtLimit) {
      Alert.alert('Limit Reached', 'Please upgrade your plan to add more seats.');
      return;
    }
    addUser(formData);
    setFormData({ name: '', email: '', role: 'User' });
    setIsModalVisible(false);
  };

  const progressPercentage = (usedSeats / totalSeats) * 100;

  return (
    <View style={styles.container}>
      {/* Header Container */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Team Management</Text>
          <Text style={styles.subtitle}>Welcome back, {user.name} ({user.role})</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Seat Usage Information */}
        <View style={styles.card}>
          <View style={styles.seatHeader}>
            <View>
              <Text style={styles.cardTitle}>Seat Usage</Text>
              <Text style={styles.seatCount}>
                {usedSeats} of {totalSeats} seats used
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.upgradeBtn}
              onPress={() => Alert.alert('Upgrade Plan', 'Redirecting to billing...')}
            >
              <Text style={styles.upgradeText}>Upgrade Plan</Text>
              <ExternalLink size={14} color="#007AFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progressPercentage}%` },
                progressPercentage > 90 ? { backgroundColor: '#FF3B30' } : null
              ]} 
            />
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.addBtn, isAtLimit && styles.disabledBtn]}
              onPress={() => setIsModalVisible(true)}
              disabled={isAtLimit}
            >
              <UserPlus size={20} color={isAtLimit ? '#999' : '#FFF'} />
              <Text style={[styles.btnText, isAtLimit && styles.disabledText]}>
                Add Team Member
              </Text>
            </TouchableOpacity>
            
            {isAtLimit && (
              <Text style={styles.limitWarning}>
                Limit reached! Upgrade for more seats.
              </Text>
            )}
          </View>
        </View>

        {/* User List Title */}
        <View style={styles.sectionHeader}>
          <Users size={20} color="#666" />
          <Text style={styles.sectionTitle}>Active Members ({users.length})</Text>
        </View>

        {/* User List Cards */}
        {users.map((member) => (
          <View key={member.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{member.name[0]}</Text>
              </View>
              <View>
                <Text style={styles.userName}>{member.name}</Text>
                <Text style={styles.userEmail}>{member.email}</Text>
              </View>
            </View>
            <View style={styles.userActions}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{member.role}</Text>
              </View>
              <TouchableOpacity
                onPress={() => removeUser(member.id)}
                style={styles.removeBtn}
              >
                <UserMinus size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add User Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Member</Text>
            <TextInput
              placeholder="Full Name"
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              placeholder="Email Address"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, (!formData.name || !formData.email) && styles.disabledBtn]}
                onPress={handleAddUser}
                disabled={!formData.name || !formData.email}
              >
                <Text style={styles.btnText}>Add User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  seatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  seatCount: {
    fontSize: 14,
    color: '#666',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upgradeText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34C759',
  },
  actionRow: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  addBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
    gap: 8,
  },
  disabledBtn: {
    backgroundColor: '#E5E5EA',
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: '#999',
  },
  limitWarning: {
    fontSize: 13,
    color: '#FF3B30',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E1E9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleBadge: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  removeBtn: {
    padding: 8,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F2F2F7',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  secondaryBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  secondaryBtnText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  primaryBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  restricted: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 8,
  },
  restrictedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EEF6FF',
  },
  loginBtnText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  logoutBtnText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },
});

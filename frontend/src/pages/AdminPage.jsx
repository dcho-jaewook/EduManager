import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import './AdminPage.css';

function AdminPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('users');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .rpc('get_all_users_with_roles');

            if (error) throw error;
            
            // Separate users into pending and regular users
            const regularUsers = (data || []).filter(u => u.role !== null);
            const pending = (data || []).filter(u => u.role === null);
            
            setUsers(regularUsers);
            setPendingUsers(pending);
            console.log(data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = (userId, currentRole, newRole) => {
        // Prevent editing admin roles
        if (currentRole === 'admin') {
            setError("Cannot modify admin user roles");
            return;
        }

        setSelectedUser({ id: userId, currentRole });
        setSelectedRole(newRole);
        setShowConfirmDialog(true);
    };

    const confirmRoleChange = async () => {
        try {
            const { error } = await supabase
                .rpc('update_user_role', {
                    user_id: selectedUser.id,
                    new_role: selectedRole
                });

            if (error) throw error;
            await fetchUsers(); // Refresh the user list
            setShowConfirmDialog(false);
            setSelectedUser(null);
            setSelectedRole('');
        } catch (err) {
            console.error('Error updating user role:', err);
            setError(err.message);
        }
    };

    const cancelRoleChange = () => {
        setShowConfirmDialog(false);
        setSelectedUser(null);
        setSelectedRole('');
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading admin panel...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="error">Error: {error}</div>
                <button 
                    className="btn btn-primary" 
                    onClick={() => setError(null)}
                    style={{ marginTop: '1rem' }}
                >
                    Dismiss
                </button>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="admin-header">
                <h1 className="page-title">Admin Dashboard</h1>
                <div className="admin-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        User Management
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        System Settings
                    </button>
                </div>
            </div>

            {activeTab === 'users' && (
                <div className="admin-section">
                    {/* Pending Users Section */}
                    {pendingUsers.length > 0 && (
                        <>
                            <h2>Pending Users</h2>
                            <div className="users-grid">
                                {pendingUsers.map((user) => (
                                    <div key={user.id} className="user-card pending">
                                        <div className="user-info">
                                            <h3>{user.full_name}</h3>
                                            <p>{user.email}</p>
                                            <p>Status: Pending Role Assignment</p>
                                        </div>
                                        <div className="user-actions">
                                            <select
                                                value=""
                                                onChange={(e) => handleRoleChange(user.id, null, e.target.value)}
                                                className="role-select"
                                            >
                                                <option value="">Assign Role</option>
                                                <option value="tutor">Tutor</option>
                                                <option value="student">Student</option>
                                                <option value="new_customer">New Customer</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Regular Users Section */}
                    <h2 style={{ marginTop: pendingUsers.length > 0 ? '2rem' : '0' }}>
                        User Management
                    </h2>
                    <div className="users-grid">
                        {users.map((user) => (
                            <div key={user.id} className={`user-card ${user.role === 'admin' ? 'admin' : ''}`}>
                                <div className="user-info">
                                    <h3>{user.full_name}</h3>
                                    <p>{user.email}</p>
                                    <p>Current Role: {user.role || 'No role assigned'}</p>
                                </div>
                                <div className="user-actions">
                                    <select
                                        value={user.role || ''}
                                        onChange={(e) => handleRoleChange(user.id, user.role, e.target.value)}
                                        className="role-select"
                                        disabled={user.role === 'admin'}
                                    >
                                        <option value="">No Role</option>
                                        <option value="admin">Admin</option>
                                        <option value="tutor">Tutor</option>
                                        <option value="student">Student</option>
                                        <option value="new_customer">New Customer</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="admin-section">
                    <h2>System Settings</h2>
                    <div className="settings-grid">
                        <div className="setting-card">
                            <h3>System Status</h3>
                            <p>All systems operational</p>
                        </div>
                        <div className="setting-card">
                            <h3>Database Status</h3>
                            <p>Connected and healthy</p>
                        </div>
                        <div className="setting-card">
                            <h3>Last Backup</h3>
                            <p>2024-03-20 15:30:00</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Role Change</h3>
                        <p>
                            Are you sure you want to change the role from{' '}
                            <strong>{selectedUser.currentRole || 'No Role'}</strong> to{' '}
                            <strong>{selectedRole || 'No Role'}</strong>?
                        </p>
                        <div className="modal-actions">
                            <button 
                                className="btn btn-secondary" 
                                onClick={cancelRoleChange}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={confirmRoleChange}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPage;
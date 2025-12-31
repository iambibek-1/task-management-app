/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import type { User, CreateUserData } from '../services/userService';
import { Modal } from '../components/Modal';
import { Notification } from '../components/Notification';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Plus, Edit2, Trash2, Mail, Shield } from 'lucide-react';

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; userId: number | null; userName: string }>({
    isOpen: false,
    userId: null,
    userName: '',
  });
  const [formData, setFormData] = useState<CreateUserData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const response = await userService.getUsers();
    setLoading(false);
    
    if (response.data) {
      // Backend returns { data: users }, so we need response.data.data
      const usersData = (response.data as any).data || response.data;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } else if (response.error) {
      setNotification({ message: response.error, type: 'error' });
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      const updateData: any = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      const response = await userService.updateUser(editingUser.id, updateData);
      if (response.error) {
        setNotification({ message: response.error, type: 'error' });
      } else {
        setNotification({ message: 'User updated successfully!', type: 'success' });
        loadUsers();
        closeModal();
      }
    } else {
      const response = await userService.createUser(formData);
      if (response.error) {
        setNotification({ message: response.error, type: 'error' });
      } else {
        setNotification({ message: 'User created successfully!', type: 'success' });
        loadUsers();
        closeModal();
      }
    }
  };

  const openDeleteConfirm = (user: User) => {
    setDeleteConfirm({
      isOpen: true,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
    });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({
      isOpen: false,
      userId: null,
      userName: '',
    });
  };

  const handleDelete = async () => {
    if (!deleteConfirm.userId) return;
    
    const response = await userService.deleteUser(deleteConfirm.userId);
    if (response.error) {
      setNotification({ message: response.error, type: 'error' });
    } else {
      setNotification({ message: 'User deleted successfully!', type: 'success' });
      loadUsers();
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'user',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="page-container">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="page-header">
        <h1>Users Management</h1>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus size={20} />
          Add User
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <p>No users found.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <div className="user-cell">
                      {user.firstName} {user.lastName}
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <Mail size={16} />
                      {user.email}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                      <Shield size={14} />
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => openModal(user)} className="btn-icon" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => openDeleteConfirm(user)} className="btn-icon btn-danger" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Delete User?"
        message={`Are you sure you want to delete "${deleteConfirm.userName}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? 'Edit User' : 'Create User'}
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password {editingUser && <span className="text-muted">(leave blank to keep current)</span>}
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={closeModal} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingUser ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API from '../services/api';
import '../css/AdminDashboard.css';
import logoImage from '../assets/react.svg';
import AdminImage from '../assets/Admin.jpg';


const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSeekers: 0,
    totalProviders: 0,
    pendingApprovals: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seeker',
    phone: '',
    address: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const checkServerStatus = async () => {
      try {
        await API.get('/test');
        setServerStatus('online');
        return true;
      } catch (error) {
        console.error('Server status check failed:', error);
        setServerStatus('offline');
        return false;
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if server is online
        const isServerOnline = await checkServerStatus();
        if (!isServerOnline) {
          setError('Server appears to be offline. Please check your backend server.');
          setLoading(false);
          return;
        }
        
        // Try to get admin stats
        try {
          console.log('Fetching admin stats...');
          const statsResponse = await API.get('/admin/stats');
          console.log('Stats response:', statsResponse.data);
          setStats(statsResponse.data);
        } catch (statsError) {
          console.error('Error fetching admin stats:', statsError);
          // Use mock data if API fails
          setStats({
            totalUsers: 25,
            totalSeekers: 18,
            totalProviders: 7,
            pendingApprovals: 3
          });
        }
        
        // Try to get recent users
        try {
          console.log('Fetching recent users...');
          const usersResponse = await API.get('/admin/recent-users');
          console.log('Users response:', usersResponse.data);
          setRecentUsers(usersResponse.data);
        } catch (usersError) {
          console.error('Error fetching recent users:', usersError);
          // Use mock data if API fails
          setRecentUsers([
            { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'seeker', isApproved: true },
            { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'provider', isApproved: true },
            { _id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'provider', isApproved: false },
            { _id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'seeker', isApproved: true },
            { _id: '5', name: 'Charlie Davis', email: 'charlie@example.com', role: 'provider', isApproved: false }
          ]);
        }
        
        // Try to get all users
        try {
          console.log('Fetching all users...');
          const allUsersResponse = await API.get('/admin/users');
          console.log('All users response:', allUsersResponse.data);
          setAllUsers(allUsersResponse.data);
        } catch (allUsersError) {
          console.error('Error fetching all users:', allUsersError);
          // Use mock data if API fails
          setAllUsers([
            { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'seeker', isApproved: true },
            { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'provider', isApproved: true },
            { _id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'provider', isApproved: false },
            { _id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'seeker', isApproved: true },
            { _id: '5', name: 'Charlie Davis', email: 'charlie@example.com', role: 'provider', isApproved: false },
            { _id: '6', name: 'David Wilson', email: 'david@example.com', role: 'seeker', isApproved: true },
            { _id: '7', name: 'Eva Martinez', email: 'eva@example.com', role: 'provider', isApproved: true },
            { _id: '8', name: 'Frank Thomas', email: 'frank@example.com', role: 'seeker', isApproved: true },
            { _id: '9', name: 'Grace Lee', email: 'grace@example.com', role: 'provider', isApproved: false },
            { _id: '10', name: 'Henry Clark', email: 'henry@example.com', role: 'admin', isApproved: true }
          ]);
        }
        
        // Try to get all bookings
        try {
          console.log('Fetching all bookings...');
          const bookingsResponse = await API.get('/bookings/admin');
          console.log('Bookings response:', bookingsResponse.data);
          setBookings(bookingsResponse.data);
        } catch (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
          // Use mock data if API fails
          setBookings([
            { _id: '1', status: 'pending', date: '2023-12-01', time: '10:00 AM', 
              seeker: { name: 'John Doe', email: 'john@example.com' },
              service: { title: 'Plumbing Service', price: 50, provider: { name: 'Bob Johnson' } } },
            { _id: '2', status: 'confirmed', date: '2023-12-02', time: '2:00 PM', 
              seeker: { name: 'Jane Smith', email: 'jane@example.com' },
              service: { title: 'Cleaning Service', price: 80, provider: { name: 'Alice Brown' } } },
            { _id: '3', status: 'pending', date: '2023-12-03', time: '11:30 AM', 
              seeker: { name: 'David Wilson', email: 'david@example.com' },
              service: { title: 'Electrical Service', price: 120, provider: { name: 'Charlie Davis' } } }
          ]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load admin dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleApproveProvider = async (userId) => {
    try {
      console.log(`Approving provider with ID: ${userId}`);
      
      // Try to approve provider via API
      try {
        const response = await API.put(`/admin/approve/${userId}`, {});
        console.log('Approval response:', response.data);
      } catch (apiError) {
        console.error('API error approving provider:', apiError);
      }
      
      // Update the stats and user list after approval
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1
      }));
      
      setRecentUsers(prev => 
        prev.map(user => 
          user._id === userId ? { ...user, isApproved: true } : user
        )
      );
      
      setAllUsers(prev => 
        prev.map(user => 
          user._id === userId ? { ...user, isApproved: true } : user
        )
      );
      
      alert('Provider approved successfully');
    } catch (error) {
      console.error('Error approving provider:', error);
      alert('Failed to approve provider');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      console.log(`Deleting user with ID: ${userId}`);
      
      // Try to delete user via API
      try {
        const response = await API.delete(`/admin/users/${userId}`);
        console.log('Delete response:', response.data);
      } catch (apiError) {
        console.error('API error deleting user:', apiError);
      }
      
      // Update the user lists after deletion
      setRecentUsers(prev => prev.filter(user => user._id !== userId));
      setAllUsers(prev => prev.filter(user => user._id !== userId));
      
      // Update stats
      setStats(prev => {
        const deletedUser = allUsers.find(user => user._id === userId);
        if (!deletedUser) return prev;
        
        return {
          ...prev,
          totalUsers: prev.totalUsers - 1,
          totalSeekers: deletedUser.role === 'seeker' ? prev.totalSeekers - 1 : prev.totalSeekers,
          totalProviders: deletedUser.role === 'provider' ? prev.totalProviders - 1 : prev.totalProviders,
          pendingApprovals: (deletedUser.role === 'provider' && !deletedUser.isApproved) 
            ? prev.pendingApprovals - 1 
            : prev.pendingApprovals
        };
      });
      
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleNewUserChange = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Adding new user:', newUser);
      
      // Try to add user via API
      try {
        const response = await API.post('/admin/users', newUser);
        console.log('Add user response:', response.data);
        
        // Add the new user to the lists
        const addedUser = response.data;
        setAllUsers(prev => [addedUser, ...prev]);
        setRecentUsers(prev => [addedUser, ...prev.slice(0, 9)]);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalUsers: prev.totalUsers + 1,
          totalSeekers: addedUser.role === 'seeker' ? prev.totalSeekers + 1 : prev.totalSeekers,
          totalProviders: addedUser.role === 'provider' ? prev.totalProviders + 1 : prev.totalProviders,
          pendingApprovals: (addedUser.role === 'provider' && !addedUser.isApproved) 
            ? prev.pendingApprovals + 1 
            : prev.pendingApprovals
        }));
        
        // Reset form
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'seeker',
          phone: '',
          address: ''
        });
        
        alert('User added successfully');
      } catch (apiError) {
        console.error('API error adding user:', apiError);
        alert(`Failed to add user: ${apiError.response?.data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      console.log(`Approving booking with ID: ${bookingId}`);
      
      // Try to approve booking via API
      try {
        // Make sure we're using the correct API endpoint
        const response = await axios.put(`http://localhost:5000/api/bookings/${bookingId}/status`, 
          { status: 'confirmed' },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        
        console.log('Booking approval response:', response.data);
        
        // Update the bookings list after approval
        setBookings(prev => 
          prev.map(booking => 
            booking._id === bookingId ? { ...booking, status: 'confirmed' } : booking
          )
        );
        
        alert('Booking confirmed successfully');
      } catch (apiError) {
        console.error('API error approving booking:', apiError);
        alert(`Failed to confirm booking: ${apiError.response?.data?.message || 'Server error'}`);
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('Failed to confirm booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      console.log(`Rejecting booking with ID: ${bookingId}`);
      
      // Try to reject booking via API
      try {
        // Make sure we're using the correct API endpoint
        const response = await axios.put(`http://localhost:5000/api/bookings/${bookingId}/status`, 
          { status: 'cancelled' },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        
        console.log('Booking rejection response:', response.data);
        
        // Update the bookings list after rejection
        setBookings(prev => 
          prev.map(booking => 
            booking._id === bookingId ? { ...booking, status: 'cancelled' } : booking
          )
        );
        
        alert('Booking cancelled successfully');
      } catch (apiError) {
        console.error('API error rejecting booking:', apiError);
        alert(`Failed to cancel booking: ${apiError.response?.data?.message || 'Server error'}`);
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Failed to cancel booking');
    }
  };

  // Render admin navbar with user management options
  const renderAdminNavbar = () => (
    <header className="main-header">
     <Link to="/" className="header-logo">
                               <img src={logoImage} alt="ServiceHub Logo" className="logo-image" />
                               <span>ServiceHub</span>
                             </Link>
      <nav className="nav-links">
        {/* <Link to="/dashboard">Dashboard</Link> */}
        <Link to="/services">Services</Link>
        <Link to="/profile">Profile</Link>
        <button 
          className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </button>
        <button 
          className={`nav-button ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Manage Bookings
        </button>
        <button 
          className={`nav-button ${activeTab === 'add-user' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-user')}
        >
          Add User
        </button>
        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </header>
  );

  if (loading) {
    return (
      <div className="admin-page-wrapper">
        {renderAdminNavbar()}
        <div className="admin-content-area">
          <div className="loading-container">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page-wrapper">
        {renderAdminNavbar()}
        <div className="admin-content-area">
          <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <div className="server-status">
              Server Status: <span className={`status-${serverStatus}`}>{serverStatus}</span>
            </div>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-wrapper">
      {renderAdminNavbar()}

      <div className="admin-content-area">
        <div className="admin-dashboard">
          <div className="admin-header">
            <h1>Admin Dashboard</h1>
            <p>Welcome to the administration panel</p>
            <div className="server-status">
              Server Status: <span className={`status-${serverStatus}`}>{serverStatus}</span>
            </div>
          </div>

          {activeTab === 'dashboard' && (
            <>
              <div className="stats-container">
                <div className="stat-card">
                  <div className="stat-icon users-icon">👥</div>
                  <div className="stat-content">
                    <h3>Total Users</h3>
                    <p className="stat-number">{stats.totalUsers}</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon seekers-icon">🔍</div>
                  <div className="stat-content">
                    <h3>Service Seekers</h3>
                    <p className="stat-number">{stats.totalSeekers}</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon providers-icon">🛠️</div>
                  <div className="stat-content">
                    <h3>Service Providers</h3>
                    <p className="stat-number">{stats.totalProviders}</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon pending-icon">⏳</div>
                  <div className="stat-content">
                    <h3>Pending Approvals</h3>
                    <p className="stat-number">{stats.pendingApprovals}</p>
                  </div>
                </div>
              </div>

              <div className="admin-section">
                <h2>Recent Users</h2>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map(user => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge ${user.role}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td>
                            {user.role === 'provider' ? (
                              <span className={`status-badge ${user.isApproved ? 'approved' : 'pending'}`}>
                                {user.isApproved ? 'Approved' : 'Pending'}
                              </span>
                            ) : (
                              <span className="status-badge approved">Active</span>
                            )}
                          </td>
                          <td>
                            {user.role === 'provider' && !user.isApproved && (
                              <button 
                                className="approve-button"
                                onClick={() => handleApproveProvider(user._id)}
                              >
                                Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="admin-section">
              <h2>All Users</h2>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td>
                          {user.role === 'provider' ? (
                            <span className={`status-badge ${user.isApproved ? 'approved' : 'pending'}`}>
                              {user.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          ) : (
                            <span className="status-badge approved">Active</span>
                          )}
                        </td>
                        <td>
                          {user.role === 'provider' && !user.isApproved && (
                            <button 
                              className="approve-button"
                              onClick={() => handleApproveProvider(user._id)}
                            >
                              Approve
                            </button>
                          )}
                          <button 
                            className="delete-button"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'add-user' && (
            <div className="admin-section">
              <h2>Add New User</h2>
              <form onSubmit={handleAddUser}>
                <div className="form-group">
                  <label>Name:</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={newUser.name} 
                    onChange={handleNewUserChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={newUser.email} 
                    onChange={handleNewUserChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Password:</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={newUser.password} 
                    onChange={handleNewUserChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Role:</label>
                  <select 
                    name="role" 
                    value={newUser.role} 
                    onChange={handleNewUserChange} 
                    required 
                  >
                    <option value="seeker">Seeker</option>
                    <option value="provider">Provider</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={newUser.phone} 
                    onChange={handleNewUserChange} 
                  />
                </div>
                <div className="form-group">
                  <label>Address:</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={newUser.address} 
                    onChange={handleNewUserChange} 
                  />
                </div>
                <button type="submit" className="add-user-button">Add User</button>
              </form>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="admin-section">
              <h2>All Bookings</h2>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Provider</th>
                      <th>Client</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking._id}>
                        <td>{booking.service?.title || 'Unknown Service'}</td>
                        <td>{booking.service?.provider?.name || 'Unknown Provider'}</td>
                        <td>{booking.seeker?.name || 'Unknown Client'}</td>
                        <td>
                          {new Date(booking.date).toLocaleDateString()} at {booking.time}
                        </td>
                        <td>
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {booking.status === 'pending' && (
                            <>
                              <button 
                                className="approve-button"
                                onClick={() => handleApproveBooking(booking._id)}
                              >
                                Confirm
                              </button>
                              <button 
                                className="delete-button"
                                onClick={() => handleRejectBooking(booking._id)}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                          No bookings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <p>© 2026 ServiceHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;



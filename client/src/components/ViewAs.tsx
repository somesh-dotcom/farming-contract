import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, User, UserCheck } from 'lucide-react';

const ViewAs = () => {
  const { user, impersonateUser, stopImpersonation } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch farmers and buyers for admin to view as
    if (user?.role === 'ADMIN') {
      const fetchUsers = async () => {
        try {
          const response = await fetch('/api/users');
          const data = await response.json();
          
          if (data.users) {
            // Filter to get farmers and buyers only
            const filteredUsers = data.users.filter(
              (u: any) => u.role === 'FARMER' || u.role === 'BUYER'
            );
            setAvailableUsers(filteredUsers);
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };

      fetchUsers();
    }
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return null;
  }

  const handleImpersonate = async (userId: string) => {
    try {
      // Find the user to impersonate
      const targetUser = availableUsers.find(u => u.id === userId);
      if (targetUser) {
        // Call the impersonation function in auth context
        await impersonateUser(targetUser);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Error impersonating user:', error);
    }
  };

  // Check if currently impersonating
  const isImpersonating = user?.originalRole === 'ADMIN';

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isImpersonating 
            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        }`}
      >
        {isImpersonating ? (
          <>
            <Eye className="w-4 h-4" />
            Viewing as {user.role.toLowerCase()} 
            <span className="text-xs bg-yellow-200 px-1.5 py-0.5 rounded">
              Admin
            </span>
          </>
        ) : (
          <>
            <User className="w-4 h-4" />
            View As
          </>
        )}
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">View As User</h3>
            <p className="text-xs text-gray-600">Switch to farmer or buyer perspective</p>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {availableUsers.length > 0 ? (
              availableUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleImpersonate(u.id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-b-0"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    u.role === 'FARMER' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 text-sm">{u.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        u.role === 'FARMER' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                      <span>{u.email}</span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                No farmers or buyers available
              </div>
            )}
          </div>

          {isImpersonating && (
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={stopImpersonation}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
              >
                <UserCheck className="w-4 h-4" />
                Return to Admin View
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewAs;
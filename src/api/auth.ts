// src/api/auth.ts
// Remove the API_BASE_URL completely and use relative paths

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface DashboardData {
  welcome_message: string;
  stats: {
    total_balance: number;
    monthly_income: number;
    monthly_expenses: number;
  };
  monthly_trend: {
    month: string;
    income: number;
    expenses: number;
  }[];
  category_distribution: {
    category: string;
    value: number;
  }[];
  recent_transactions: {
    id: string;
    date: string;
    description: string;
    amount: number;
    category: string;
  }[];
}

export const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Debug the response structure
    console.log('Registration response:', data);

    // Handle different response structures
    const authData = data.data || data;
    if (!authData.access_token || !authData.user) {
      throw new Error('Invalid response structure from server');
    }

    return {
      access_token: authData.access_token,
      user: authData.user
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        email: email.trim().toLowerCase(),
        password: password.trim()
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    // Check for network errors
    if (!response) {
      throw new Error('Network request failed');
    }

    // Handle non-success status codes
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }
      throw new Error(errorData.message || errorData.error || 'Login failed');
    }

    // Parse successful response
    try {
      const data = await response.json();
      
      if (!data?.status || data.status !== 'success') {
        // Handle the case where the backend returns a message for no linked accounts
        if (data.message) {
           return data; // Return the data object as is if it contains a message
        }
        throw new Error(data?.message || 'Invalid response format');
      }

      return data.data; // Return the data.data for successful login
    } catch (e) {
      console.error('Response parsing error:', e);
      throw new Error('Failed to process server response');
    }
  } catch (error) {
    console.error('Login request failed:', error);
    
    // Handle specific error cases
    let errorMessage = 'Login failed';
    if (error instanceof TypeError) {
      errorMessage = 'Network error occurred';
    } else if (error.name === 'AbortError') {
      errorMessage = 'Request timed out';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

export const getDashboardData = async (token: string): Promise<DashboardData> => {
  try {
    console.log("[Dashboard] Using token:", token); // Debug token
    
    const response = await fetch('/api/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    console.log("[Dashboard] Response status:", response.status);
    
    const data = await response.json();

    if (!response.ok) {
      console.error("[Dashboard] Error details:", data);
      throw new Error(data.error || data.message || 'Failed to fetch dashboard data');
    }

    return data;
  } catch (error) {
    console.error("[Dashboard] Request failed:", error);
    throw error;
  }
};
import { AnalysisHistoryItem, AnalysisResult, User } from "../types";

const HISTORY_KEY = 'oratoria_ai_history';
const USERS_KEY = 'oratoria_ai_users';
const SESSION_KEY = 'oratoria_ai_session';

// --- AUTHENTICATION SERVICE ---

export const registerUser = (userData: Omit<User, 'id' | 'joinDate'>): User => {
  const users = getUsers();
  
  // Check if email exists
  if (users.find(u => u.email === userData.email)) {
    throw new Error("Email already registered");
  }

  const newUser: User = {
    id: Date.now().toString(),
    joinDate: new Date().toISOString(),
    ...userData
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Auto login after register
  setCurrentSession(newUser);
  
  return newUser;
};

export const loginUser = (email: string, password: string): User => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error("Invalid credentials");
  }

  setCurrentSession(user);
  return user;
};

export const logoutUser = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const deleteAccount = (userId: string): void => {
  let users = getUsers();
  users = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  logoutUser();
  // Optionally clear user history here if desired, but we'll leave it in the DB 
  // linked to a non-existent ID or clean it up. For simplicity, we just leave it or clear logic in App.
};

export const getCurrentSession = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

const setCurrentSession = (user: User): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

const getUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

// --- HISTORY SERVICE ---

export const saveAnalysisToHistory = (
  result: AnalysisResult, 
  topic?: string, 
  goal?: string
): void => {
  try {
    const currentUser = getCurrentSession();
    
    const newItem: AnalysisHistoryItem = {
      id: Date.now().toString(),
      userId: currentUser?.id, // Associate with user if logged in
      date: new Date().toISOString(),
      result,
      topic,
      goal
    };

    const existingHistory = getHistory(); // This now gets all history
    const updatedHistory = [newItem, ...existingHistory]; 

    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Error saving history:", error);
  }
};

export const getHistory = (): AnalysisHistoryItem[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    const allHistory = stored ? JSON.parse(stored) as AnalysisHistoryItem[] : [];
    
    const currentUser = getCurrentSession();
    
    if (currentUser) {
      // Return history for this user
      return allHistory.filter(item => item.userId === currentUser.id);
    } else {
      // Return anonymous history (items without userId)
      return allHistory.filter(item => !item.userId);
    }
  } catch (error) {
    console.error("Error reading history:", error);
    return [];
  }
};

export const clearHistory = (): void => {
  const currentUser = getCurrentSession();
  
  if (currentUser) {
    // Only clear this user's history, keep others
    const stored = localStorage.getItem(HISTORY_KEY);
    let allHistory = stored ? JSON.parse(stored) as AnalysisHistoryItem[] : [];
    allHistory = allHistory.filter(item => item.userId !== currentUser.id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
  } else {
     // Clear anonymous history
     const stored = localStorage.getItem(HISTORY_KEY);
     let allHistory = stored ? JSON.parse(stored) as AnalysisHistoryItem[] : [];
     allHistory = allHistory.filter(item => !!item.userId); // Keep logged in users history
     localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
  }
};
// Temporary mock service - will be replaced with real implementations

export const clearHistory = () => {
  console.log('clearHistory - pendiente implementar');
};

export const loginUser = (email: string, password: string) => {
  console.log('loginUser - pendiente implementar', { email });
  return null;
};

export const registerUser = (data: any) => {
  console.log('registerUser - pendiente implementar', data);
  return null;
};

export const deleteAccount = (userId?: string) => {
  console.log('deleteAccount - pendiente implementar', userId);
};

export const logoutUser = () => {
  console.log('logoutUser - pendiente implementar');
};

export const getCurrentSession = () => {
  console.log('getCurrentSession - pendiente implementar');
  return null;
};

export const getHistory = () => {
  console.log('getHistory - pendiente implementar');
  return [];
};

export const saveAnalysisToHistory = (result: any, topic: string, goal: string) => {
  console.log('saveAnalysisToHistory - pendiente implementar', { result, topic, goal });
};
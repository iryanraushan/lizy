export const USER_ROLES = {
  PROVIDER: 'PROVIDER',
  SEEKER: 'SEEKER'
};

export const ROLE_LABELS = {
  [USER_ROLES.PROVIDER]: 'Provider',
  [USER_ROLES.SEEKER]: 'Seeker'
};

export const getRoleLabel = (role) => {
  return ROLE_LABELS[role] || role;
};

export const isProvider = (user) => {
  return user?.role?.toLowerCase() === USER_ROLES.PROVIDER.toLowerCase();
};

export const isSeeker = (user) => {
  return user?.role?.toLowerCase() === USER_ROLES.SEEKER.toLowerCase();
};
export const USER_ROLES = {
    SCHOOL: 'SCHOOL',
    UMURENGE: 'UMURENGE',
    DISTRICT: 'DISTRICT',
    MINEDUC: 'MINEDUC'
};

export const ROLE_LABELS = {
    [USER_ROLES.SCHOOL]: 'School',
    [USER_ROLES.UMURENGE]: 'Umurenge',
    [USER_ROLES.DISTRICT]: 'District',
    [USER_ROLES.MINEDUC]: 'Mineduc'
};

export const getRoles = () => {
    return Object.values(USER_ROLES);
};

export const getRoleLabel = (role) => {
    return ROLE_LABELS[role] || role;
};
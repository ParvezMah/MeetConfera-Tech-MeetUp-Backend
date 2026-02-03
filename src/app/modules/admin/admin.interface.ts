export type IAdminFilterRequest = {
    name?: string | undefined;
    email?: string | undefined;
    contactNumber?: string | undefined;
    searchTerm?: string | undefined;
}

export interface AdminStats {
    totalUsers: number;
    totalAdmins: number;
    totalHosts: number;
    totalEvents: number;
    totalRevenue: number;
}

export interface AdminActivities {
    id: string;
    type: 'USER' | 'EVENT' | 'HOST' | 'PAYMENT';
    title: string;
    description: string;
    createdAt: string;
}
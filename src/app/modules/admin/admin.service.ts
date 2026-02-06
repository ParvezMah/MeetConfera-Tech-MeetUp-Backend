
import { AdminActivities, AdminStats, IAdminFilterRequest } from "./admin.interface";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { adminSearchAbleFields } from "./admin.constant";
import { Admin, Prisma, UserStatus } from "@prisma/client";
import prisma from "../../shared/prisma";


const getAllFromDB = async (params: IAdminFilterRequest, options: IOptions) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;

    const andCondions: Prisma.AdminWhereInput[] = [];

    if (params.searchTerm) {
        andCondions.push({
            OR: adminSearchAbleFields.map(field => ({
                [field]: {
                    contains: params.searchTerm,
                    mode: 'insensitive'
                }
            }))
        })
    };

    if (Object.keys(filterData).length > 0) {
        andCondions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        })
    };

    andCondions.push({
        isDeleted: false
    })

    //console.dir(andCondions, { depth: 'inifinity' })
    const whereConditons: Prisma.AdminWhereInput = { AND: andCondions }

    const result = await prisma.admin.findMany({
        where: whereConditons,
        include: {
            user: true
        },
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder ? {
            [options.sortBy]: options.sortOrder
        } : {
            createdAt: 'desc'
        }
    });

    const total = await prisma.admin.count({
        where: whereConditons
    });

    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    };
};

const getByIdFromDB = async (id: string): Promise<Admin | null> => {
    const result = await prisma.admin.findUnique({
        where: {
            id,
            isDeleted: false
        }
    })

    return result;
};

const updateIntoDB = async (id: string, data: Partial<Admin>): Promise<Admin> => {
    await prisma.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false
        }
    });

    const result = await prisma.admin.update({
        where: {
            id
        },
        data
    });

    return result;
};

const deleteFromDB = async (id: string): Promise<Admin | null> => {

    await prisma.admin.findUniqueOrThrow({
        where: {
            id
        }
    });

    const result = await prisma.$transaction(async (transactionClient) => {
        const adminDeletedData = await transactionClient.admin.delete({
            where: {
                id
            }
        });

        await transactionClient.user.delete({
            where: {
                email: adminDeletedData.email
            }
        });

        return adminDeletedData;
    });

    return result;
}


const softDeleteFromDB = async (id: string): Promise<Admin | null> => {
    await prisma.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false
        }
    });

    const result = await prisma.$transaction(async (transactionClient) => {
        const adminDeletedData = await transactionClient.admin.update({
            where: {
                id
            },
            data: {
                isDeleted: true
            }
        });

        await transactionClient.user.update({
            where: {
                email: adminDeletedData.email
            },
            data: {
                status: UserStatus.ACTIVE
            }
        });

        return adminDeletedData;
    });

    return result;
}


const getAdminStats = async (): Promise<AdminStats> => {
    return {
        totalUsers: await prisma.user.count(),
        totalAdmins: await prisma.admin.count(),
        totalHosts: await prisma.host.count(),
        totalEvents: await prisma.event.count(),
        totalRevenue: await prisma.payment.count(),
    }
}

const getAdminActivities = async (limit = 10): Promise<AdminActivities[]> => {
    // Fetch recent users
    const recentUsers = await prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, createdAt: true }
    });

    // Fetch recent events
    const recentEvents = await prisma.event.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, eventName: true, createdAt: true, host: { select: { name: true } } }
    });

    // Fetch recent hosts (approved)
    const recentHosts = await prisma.host.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, createdAt: true }
    });

    // Fetch recent payments (using Participant as proxy if Payment table doesn't have createdAt, 
    // but assuming we want to show payment activities. 
    // The previous plan said Payment table lacks createdAt, checking Participant)
    const recentPayments = await prisma.payment.findMany({
        take: limit,
        orderBy: { participant: { createdAt: 'desc' } }, // Assuming logic or using payment data if available
        select: { id: true, amount: true, event: { select: { eventName: true } }, participant: { select: { createdAt: true } } }
    });


    const activities: AdminActivities[] = [
        ...recentUsers.map(u => ({
            id: u.id,
            type: 'USER' as const,
            title: 'New user registered',
            description: `${u.email} joined the platform`,
            createdAt: u.createdAt.toISOString()
        })),
        ...recentEvents.map(e => ({
            id: e.id,
            type: 'EVENT' as const,
            title: 'New event created',
            description: `${e.eventName} by ${e.host.name}`,
            createdAt: e.createdAt.toISOString()
        })),
        ...recentHosts.map(h => ({
            id: h.id,
            type: 'HOST' as const,
            title: 'Host joined',
            description: `Host ${h.name} joined`,
            createdAt: h.createdAt.toISOString()
        })),
        ...recentPayments.map(p => ({
            id: p.id,
            type: 'PAYMENT' as const,
            title: 'Payment received',
            description: `$${p.amount} for ${p.event.eventName}`,
            createdAt: p.participant.createdAt.toISOString()
        }))
    ];

    // Sort combined activities by date desc
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return activities.slice(0, limit);
};

const getDashboardChartData = async () => {
    // 1. Event Bookings Trend (Last 30 days) - Using Participant creation as booking
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bookings = await prisma.participant.groupBy({
        by: ['createdAt'],
        where: {
            createdAt: { gte: thirtyDaysAgo }
        },
        _count: { id: true },
    });

    // Process bookings into daily counts
    const bookingsMap = new Map<string, number>();
    bookings.forEach(b => {
        const date = b.createdAt.toISOString().split('T')[0];
        bookingsMap.set(date, (bookingsMap.get(date) || 0) + b._count.id);
    });

    const eventBookingsData = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        eventBookingsData.push({
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            bookings: bookingsMap.get(dateStr) || 0
        });
    }


    // 2. User Registration Trend (Last 5 weeks)
    // Simplify: Just last 30 days for now to keep it simpler or grouping by week is complex in raw JS without DB helpers
    // Let's do daily for users too, or 4 weeks
    const users = await prisma.user.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { id: true }
    });

    // Group into weeks
    const userRegistrationData = [];
    // ... logic to group by week ... 
    // For simplicity, let's return last 4 weeks count
    // (Pseudocode simplified for implementing robustly)
    // Actually, let's stick to the requested structure: week 1, week 2...

    // Alternative: Just group by day for now or standard implementation
    // Let's return the same structure as mock for consistency but real data
    // Implementing a simple week grouper:
    const weekCounts = [0, 0, 0, 0, 0];
    const now = new Date();
    users.forEach(u => {
        const diffTime = Math.abs(now.getTime() - u.createdAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(diffDays / 7);
        if (weekIndex < 5) {
            weekCounts[4 - weekIndex] += u._count.id; // 4 is latest week
        }
    });

    const userRegistrationDataFinal = weekCounts.map((count, i) => ({
        week: `Week ${i + 1}`,
        users: count
    }));


    // 3. Events by Category
    const categoryGroups = await prisma.event.groupBy({
        by: ['category'],
        _count: { id: true }
    });
    const eventCategoryData = categoryGroups.map(g => ({
        name: g.category,
        value: g._count.id
    }));


    // 4. Event Status Distribution
    const statusGroups = await prisma.event.groupBy({
        by: ['status'],
        _count: { id: true }
    });
    const statusColors: Record<string, string> = {
        OPEN: "#3b82f6",
        ONGOING: "#10b981", // Mapping arbitrary status to colors
        COMPLETED: "#8b5cf6",
        CANCELED: "#ef4444"
    };

    const eventStatusData = statusGroups.map(g => ({
        name: g.status,
        value: g._count.id,
        color: statusColors[g.status] || "#94a3b8"
    }));

    return {
        eventBookingsData,
        userRegistrationData: userRegistrationDataFinal,
        eventCategoryData,
        eventStatusData
    };
}


export const AdminService = {
    getAllFromDB,
    getByIdFromDB,
    updateIntoDB,
    deleteFromDB,
    softDeleteFromDB,
    getAdminStats,
    getAdminActivities,
    getDashboardChartData
}
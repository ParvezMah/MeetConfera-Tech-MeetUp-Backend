
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

const getAdminActivities = async (limit=10): Promise<AdminActivities[]> => {

    const activities: AdminActivities[] = [
        {
            id: '1',
            type: 'USER',
            title: 'New user registered',
            description: 'john.doe@gmail.com joined the platform',
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            type: 'EVENT',
            title: 'New event created',
            description: 'Tech Meetup 2026 created by Host Alex',
            createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        },
        {
            id: '3',
            type: 'HOST',
            title: 'Host approved',
            description: 'Host Sarah approved by admin',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
            id: '4',
            type: 'PAYMENT',
            title: 'Payment received',
            description: '$120 payment for Startup Workshop',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
        }
    ];

    return activities.slice(0, limit);
};


export const AdminService = {
    getAllFromDB,
    getByIdFromDB,
    updateIntoDB,
    deleteFromDB,
    softDeleteFromDB,
    getAdminStats,
    getAdminActivities
}
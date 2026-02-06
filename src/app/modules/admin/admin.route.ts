import { UserRole } from '@prisma/client';

import express from 'express';
import roleBasedAuth from '../../middlewares/roleBasedAuth';
import { AdminController } from './admin.controller';
import validateRequest from '../../middlewares/validateRequest';
import { adminValidationSchemas } from './admin.validation';



const router = express.Router();

router.get('/',
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    AdminController.getAllFromDB
);

router.get('/stats',
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    AdminController.getAdminStats
)

router.get('/stats/charts',
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    AdminController.getDashboardChartData
)

router.get('/recent-activities',
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    AdminController.getAdminActivities
)

router.get('/:id',
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    AdminController.getByIdFromDB
);

router.patch('/:id',
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validateRequest(adminValidationSchemas.update),
    AdminController.updateIntoDB
);

router.delete('/:id',
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    AdminController.deleteFromDB
);


router.delete('/soft-delete/:id',
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    AdminController.softDeleteFromDB
);





export const AdminRoutes = router;
import express from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { EventRoutes } from "../modules/event/event.route";
import { HostRoutes } from "../modules/host/host.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { ParticipantRoutes } from "../modules/participant/participant.route";
import { ReviewRoutes } from "../modules/review/review.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/events",
    route: EventRoutes,
  },
  {
    path: "/hosts",
    route: HostRoutes,
  },
  {
    path: "/admins",
    route: AdminRoutes,
  },
  {
    path: "/participants",
    route: ParticipantRoutes,
  },
  {
    path: "/review",
    route: ReviewRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

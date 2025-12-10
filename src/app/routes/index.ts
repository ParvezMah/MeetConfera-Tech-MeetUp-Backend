import express from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { EventRoutes } from "../modules/event/event.route";
import { HostRoutes } from "../modules/host/host.route";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

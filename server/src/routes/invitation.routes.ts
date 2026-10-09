import { Router } from "express";

import {
  createInvite
} from "../controllers/invitation.controller.js";

import { acceptInvite } from "../controllers/acceptInvite.controller.js";

import { authenticate } from "../middlewares/authenticate.js";
import { requireOrganization } from "../middlewares/orgCheck.js";
import { requireRole } from "../middlewares/authorization.js";

const router = Router();

// Create invitation
router.post(
  "/organizations/:organizationId/invitations",
  authenticate,
  requireOrganization,
  requireRole("OWNER", "ADMIN"),
  createInvite
);

// Accept invitation
router.post(
  "/invitations/accept",
  acceptInvite
);

export default router;
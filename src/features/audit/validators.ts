import { z } from "zod";
import { AUDIT_ACTIONS } from "@/features/audit/constants";
import { paginationSchema } from "@/shared/validators";

export const auditActionEnum = z.enum(AUDIT_ACTIONS);

export const listAuditLogsSchema = paginationSchema.extend({
  /** Optional server-side action filter (the view's segmented control). */
  action: auditActionEnum.optional(),
});

export type ListAuditLogsInput = z.infer<typeof listAuditLogsSchema>;

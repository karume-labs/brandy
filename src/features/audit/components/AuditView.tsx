"use client";

import { Box, Group, Select, TextInput, Title } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { buildAuditColumns } from "@/features/audit/components/AuditColumns";
import { AUDIT_ACTIONS, auditActionLabel } from "@/features/audit/constants";
import { useAuditLogs } from "@/features/audit/services/query";
import { auditActionEnum } from "@/features/audit/validators";
import { DataTable } from "@/shared/components/table/DataTable";
import { DataToolbar } from "@/shared/components/table/DataToolbar";
import { useQueryErrorToast } from "@/shared/hooks/use-query-error-toast";

const ACTION_FILTER_DATA = [
  { value: "all", label: "All actions" },
  ...AUDIT_ACTIONS.map((action) => ({
    value: action,
    label: auditActionLabel(action),
  })),
];

/** Paginated audit log - slicing and the action filter run in the database. */
export const AuditView = () => {
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(20),
  );
  const [action, setAction] = useQueryState(
    "action",
    parseAsString.withDefault("all"),
  );

  // "all" is the UI sentinel - anything that isn't a real action resets it.
  const parsedAction = auditActionEnum.safeParse(action);
  const actionFilter = parsedAction.success ? parsedAction.data : undefined;

  const { data, isLoading, error } = useAuditLogs(page, pageSize, actionFilter);
  useQueryErrorToast(error, "Could not load the audit log");

  const entries = data?.items ?? [];
  const totalRecords = data?.total ?? 0;
  const columns = buildAuditColumns();

  return (
    <Box>
      <Group justify="space-between" align="center" my="md">
        <Title order={2}>Audit Log</Title>
      </Group>

      <Box mb="md">
        <DataToolbar
          onClear={
            action === "all" && !q
              ? undefined
              : () => {
                  setAction("all");
                  setQ("");
                  setPage(1);
                }
          }
        >
          <TextInput
            placeholder="Search logs..."
            leftSection={<IconSearch size={16} />}
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
          />
          <Select
            placeholder="Filter by action"
            data={ACTION_FILTER_DATA}
            value={action}
            onChange={(value) => {
              setAction(value ?? "all");
              setPage(1);
            }}
            allowDeselect={false}
          />
        </DataToolbar>
      </Box>

      <DataTable
        columns={columns}
        data={entries}
        totalRecords={totalRecords}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(n) => {
          setPageSize(n);
          setPage(1);
        }}
        onClearFilters={
          action === "all"
            ? undefined
            : () => {
                setAction("all");
                setPage(1);
              }
        }
        loading={isLoading}
      />
    </Box>
  );
};

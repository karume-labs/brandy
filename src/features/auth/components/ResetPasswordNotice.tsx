"use client";

import {
  Alert,
  Anchor,
  Button,
  Center,
  Container,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/shared/components/BrandLogo";

/** Post-submit success panel. */
export const ResetDoneState = () => {
  const router = useRouter();
  return (
    <Container size={420} my={40}>
      <Stack gap="xl">
        <Center>
          <BrandLogo size={56} />
        </Center>
        <Title ta="center">Password updated</Title>

        <Paper withBorder shadow="md" p={30} radius="md">
          <Stack gap="md" align="center">
            <ThemeIcon size={56} radius="xl" color="green" variant="light">
              <IconCircleCheck size={30} stroke={1.5} />
            </ThemeIcon>
            <Text ta="center" size="sm">
              Your password has been changed successfully. You can now sign in
              with your new password.
            </Text>
            <Button fullWidth onClick={() => router.push("/sign-in")}>
              Sign in
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

/** Invalid/missing-token panel. */
export const ResetLinkErrorState = ({
  urlError,
}: {
  urlError: string | null;
}) => {
  return (
    <Container size={420} my={40}>
      <Stack gap="xl">
        <Center>
          <BrandLogo size={56} />
        </Center>
        <Title ta="center">Reset link problem</Title>

        <Paper withBorder shadow="md" p={30} radius="md">
          <Stack gap="md">
            <Alert
              color="red"
              variant="light"
              title="This link is no longer valid"
              icon={<IconAlertTriangle size={18} />}
            >
              {urlError === "INVALID_TOKEN"
                ? "This reset link is invalid or has expired. Reset links can only be used once and expire after 15 minutes."
                : "This reset link is invalid or incomplete. Please request a new one to continue."}
            </Alert>
            <Button fullWidth component={Link} href="/forgot-password">
              Request a new link
            </Button>
            <Text size="sm" ta="center">
              <Anchor component={Link} href="/sign-in" inherit>
                Back to sign in
              </Anchor>
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

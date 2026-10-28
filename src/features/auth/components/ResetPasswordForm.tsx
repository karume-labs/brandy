"use client";

import {
  Alert,
  Anchor,
  Button,
  Center,
  Container,
  List,
  ListItem,
  Paper,
  PasswordInput,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { zodResolver } from "mantine-form-zod-resolver";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useResetPassword } from "@/features/auth/services/mutation";
import {
  type ResetPasswordInput,
  resetPasswordSchema,
} from "@/features/auth/validators";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { notify } from "@/shared/lib/notifications";

export const ResetPasswordForm = () => {
  const router = useRouter();
  const [token] = useQueryState("token");
  const [urlError] = useQueryState("error");
  const [done, setDone] = useState(false);
  const { mutate: resetPassword, isPending } = useResetPassword();

  const form = useForm<ResetPasswordInput>({
    initialValues: { password: "", confirmPassword: "" },
    validate: zodResolver(resetPasswordSchema),
  });

  const handleSubmit = form.onSubmit((values) => {
    if (!token) return;
    resetPassword(
      { ...values, token },
      {
        onSuccess: () => setDone(true),
        onError: (error) =>
          notify.error("Could not reset password", error.message),
      },
    );
  });

  if (done) {
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
  }

  if (!token || urlError) {
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
  }

  return (
    <Container size={420} my={40}>
      <Stack gap="xl">
        <Center>
          <BrandLogo size={56} />
        </Center>
        <Title ta="center">Set a new password</Title>
        <Text ta="center" c="dimmed" size="sm">
          Choose a strong password you haven&apos;t used before.
        </Text>

        <Paper withBorder shadow="md" p={30} radius="md">
          <form noValidate onSubmit={handleSubmit}>
            <Stack gap="md">
              <PasswordInput
                label="New password"
                placeholder="Your new password"
                required
                {...form.getInputProps("password")}
              />
              <PasswordInput
                label="Confirm password"
                placeholder="Repeat your new password"
                required
                {...form.getInputProps("confirmPassword")}
              />
              <List size="xs" c="dimmed" spacing={2}>
                <ListItem>At least 8 characters long</ListItem>
                <ListItem>Passwords must match</ListItem>
              </List>
              <Button fullWidth type="submit" loading={isPending}>
                Reset password
              </Button>
              <Text size="sm" ta="center">
                <Anchor component={Link} href="/forgot-password" inherit>
                  Send a new link instead
                </Anchor>
              </Text>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
};

"use client";

import {
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
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useState } from "react";
import {
  ResetDoneState,
  ResetLinkErrorState,
} from "@/features/auth/components/ResetPasswordNotice";
import { useResetPassword } from "@/features/auth/services/mutation";
import {
  type ResetPasswordInput,
  resetPasswordSchema,
} from "@/features/auth/validators";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { notify } from "@/shared/lib/notifications";

export const ResetPasswordForm = () => {
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

  if (done) return <ResetDoneState />;
  if (!token || urlError) return <ResetLinkErrorState urlError={urlError} />;

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

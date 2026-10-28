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
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import Link from "next/link";
import { useState } from "react";
import { useForgotPassword } from "@/features/auth/services/mutation";
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/features/auth/validators";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { notify } from "@/shared/lib/notifications";

export const ForgotPasswordForm = () => {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { mutate: requestReset, isPending } = useForgotPassword();

  const form = useForm<ForgotPasswordInput>({
    initialValues: { email: "" },
    validate: zodResolver(forgotPasswordSchema),
  });

  const handleSubmit = form.onSubmit((values) => {
    requestReset(values, {
      onSuccess: () => setSentTo(values.email),
      onError: (error) => notify.error("Could not send link", error.message),
    });
  });

  if (sentTo) {
    return (
      <Container size={420} my={40}>
        <Stack gap="xl">
          <Center>
            <BrandLogo size={56} />
          </Center>
          <Title ta="center">Check your email</Title>

          <Paper withBorder shadow="md" p={30} radius="md">
            <Stack gap="md">
              <Alert color="amber" title="Reset link sent" variant="light">
                If an account exists for <strong>{sentTo}</strong>, we have sent
                a link to reset the password. The link expires in 15 minutes.
              </Alert>
              <Text size="sm" c="dimmed" ta="center">
                Didn&apos;t get it? Check your spam folder, or try again with a
                different email.
              </Text>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setSentTo(null)}
              >
                Use a different email
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
        <Title ta="center">Forgot your password?</Title>
        <Text ta="center" c="dimmed" size="sm">
          Enter the email you signed up with and we&apos;ll send you a link to
          reset your password.
        </Text>

        <Paper withBorder shadow="md" p={30} radius="md">
          <form noValidate onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="you@company.com"
                required
                {...form.getInputProps("email")}
              />
              <Button fullWidth type="submit" loading={isPending}>
                Send reset link
              </Button>
              <Text size="sm" ta="center">
                <Anchor component={Link} href="/sign-in" inherit>
                  Back to sign in
                </Anchor>
              </Text>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
};

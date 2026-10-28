"use client";

import {
  Anchor,
  Button,
  Center,
  Checkbox,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@/features/auth/services/mutation";
import { signInSchema } from "@/features/auth/validators";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { notify } from "@/shared/lib/notifications";

export const SignInForm = () => {
  const router = useRouter();
  const { mutate: signIn, isPending } = useSignIn();

  const form = useForm({
    initialValues: { email: "", password: "", rememberMe: false },
    validate: zodResolver(signInSchema),
  });

  const handleSubmit = form.onSubmit((values) => {
    signIn(values, {
      onSuccess: () => {
        notify.success("Signed in", "Welcome back!");
        router.push("/dashboard");
      },
      onError: (err) => {
        notify.error("Sign in failed", err.message);
      },
    });
  });

  return (
    <Container size={420} my={40}>
      <Stack gap="xl">
        <Center>
          <BrandLogo size={56} priority />
        </Center>
        <Title ta="center">Welcome to Brandy</Title>

        <Paper withBorder shadow="md" p={30} radius="md">
          <form noValidate onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="you@company.com"
                required
                {...form.getInputProps("email")}
              />
              <PasswordInput
                label={
                  <>
                    <span>
                      Password{" "}
                      <Text span c="error">
                        *
                      </Text>
                    </span>
                    <Anchor
                      component={Link}
                      href="/forgot-password"
                      size="xs"
                      underline="hover"
                    >
                      Forgot password?
                    </Anchor>
                  </>
                }
                styles={{
                  // Mantine labels are inline-block (shrink-to-fit), which
                  // keeps the reset link glued to the label text - force the
                  // label to span the field so the link sits on the right.
                  label: {
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  },
                }}
                // Native required semantics match the email field, while
                // withAsterisk={false} keeps Mantine's own asterisk from
                // landing as a third flex item next to the reset link.
                required
                withAsterisk={false}
                placeholder="Your password"
                {...form.getInputProps("password")}
              />
              <Checkbox
                label="Remember me"
                {...form.getInputProps("rememberMe", { type: "checkbox" })}
              />
              <Button fullWidth type="submit" loading={isPending}>
                Sign in
              </Button>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
};

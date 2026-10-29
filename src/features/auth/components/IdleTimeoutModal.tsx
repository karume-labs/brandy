"use client";

import { Button, Group, Modal, Progress, Stack, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useIdleTimer } from "react-idle-timer";
import { authClient } from "@/features/auth/client";

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const PROMPT_TIMEOUT_MS = 60 * 1000; // 1 minute

export const IdleTimeoutModal = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState(PROMPT_TIMEOUT_MS);

  const tickInterval = useRef<NodeJS.Timeout>(null);

  const playAttentionBeep = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof window.AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
        gainNode.gain.setValueAtTime(0.5, startTime + duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playTone(600, now, 0.15);
      playTone(600, now + 0.25, 0.15);
    } catch (error) {
      console.error("Could not play beep", error);
    }
  };

  const onPrompt = () => {
    setOpen(true);
    setRemaining(PROMPT_TIMEOUT_MS);
    playAttentionBeep();
  };

  const onIdle = async () => {
    setOpen(false);
    await authClient.signOut();
    router.push("/admin/sign-in");
  };

  const onActive = () => {
    setOpen(false);
  };

  const { getRemainingTime, activate } = useIdleTimer({
    timeout: IDLE_TIMEOUT_MS,
    promptBeforeIdle: PROMPT_TIMEOUT_MS,
    onPrompt,
    onIdle,
    onActive,
    debounce: 500,
  });

  useEffect(() => {
    if (open) {
      tickInterval.current = setInterval(() => {
        setRemaining(getRemainingTime());
      }, 100);
    } else {
      if (tickInterval.current) {
        clearInterval(tickInterval.current);
      }
    }

    return () => {
      if (tickInterval.current) {
        clearInterval(tickInterval.current);
      }
    };
  }, [open, getRemainingTime]);

  const handleStillHere = () => {
    activate();
    setOpen(false);
  };

  const handleSignOut = async () => {
    setOpen(false);
    await authClient.signOut();
    router.push("/admin/sign-in");
  };

  const progressValue =
    ((PROMPT_TIMEOUT_MS - remaining) / PROMPT_TIMEOUT_MS) * 100;

  return (
    <Modal
      opened={open}
      onClose={handleStillHere}
      title="Are you still there?"
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      <Stack>
        <Text size="sm">
          You have been inactive for a while. For your security, you will be
          automatically signed out in{" "}
          <strong>{Math.ceil(remaining / 1000)} seconds</strong>.
        </Text>

        <Progress value={progressValue} color="amber" striped animated />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={handleSignOut}>
            Sign Out
          </Button>
          <Button color="amber" onClick={handleStillHere}>
            I&apos;m Still Here
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

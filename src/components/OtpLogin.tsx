"use client"

import { auth } from "@/firebaseconfig";
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword, EmailAuthProvider, linkWithCredential } from "firebase/auth";
import { startTransition, useEffect, useState, useTransition } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./ui/input-otp";

function OtpLogin() {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Password for email login
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone"); // Track the selected login method
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [resendCountDown, setResendCountDown] = useState(0);

  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountDown > 0) {
      timer = setTimeout(() => setResendCountDown(resendCountDown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountDown]);

  useEffect(() => {
    const recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        recaptchaSiteKey: "6LcMZR0UAAAAALgPMcgHwga7gY5p8QMg1Hj-bmUv",
      }
    );
    setRecaptchaVerifier(recaptchaVerifier);

    return () => recaptchaVerifier.clear();
  }, [auth]);

  useEffect(() => {
    const hasEnteredAllDigits = otp.length === 6;
    if (hasEnteredAllDigits) {
      verifyOtp();
    }
  }, [otp]);

  const verifyOtp = async () => {
    startTransition(async () => {
      setError("");

      if (!confirmationResult) {
        setError("Please request OTP first");
        return;
      }

      try {
        await confirmationResult.confirm(otp);
        if (email) {
          // Link the email to the user account
          const user = auth.currentUser;
          if (user) {
            const emailCredential = EmailAuthProvider.credential(email, "password");
            await linkWithCredential(user, emailCredential);
            setSuccess("Email linked successfully");
          }
        }
        setSuccess("Logged in successfully");
        router.replace("/");
      } catch (e) {
        setError("Failed to verify OTP, please try again later");
      }
    });
  };

  const requestOtp = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setResendCountDown(60);
    startTransition(async () => {
      setError("");

      if (!recaptchaVerifier) {
        return setError("Recaptcha verification failed");
      }

      try {
        const confirmationResult = await signInWithPhoneNumber(
          auth, phoneNumber, recaptchaVerifier
        );

        setConfirmationResult(confirmationResult);
        setSuccess("OTP sent successfully");
      } catch (err: any) {
        setResendCountDown(0);

        if (err.code === "auth/invalid-phone-number") {
          setError("Invalid phone number, Please check the number");
        } else if (err.code === "auth/too-many-requests") {
          setError("Too many requests, please try again later");
        } else {
          setError("Failed to send OTP, please try again later");
        }
      }
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess("Logged in successfully");
        router.replace("/");
      } catch (err: any) {
        if (err.code === "auth/user-not-found") {
          setError("No account found for this email");
        } else if (err.code === "auth/wrong-password") {
          setError("Incorrect password");
        } else {
          setError("Failed to login with email, please try again later");
        }
      }
    });
  };

  const loadingIndicator = (
    <div role="status" className="flex justify-center">
      <div className="spinner-border text-primary" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col justify-center items-center">
      {/* Login method selection */}
      <div className="flex space-x-4 mb-4">
        <Button onClick={() => setLoginMethod("phone")}>Phone Login</Button>
        <Button onClick={() => setLoginMethod("email")}>Email Login</Button>
      </div>

      {loginMethod === "phone" && (
        <>
          {!confirmationResult && (
            <form onSubmit={requestOtp}>
              <Input
                className="text-black"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-2">
                Please enter your number with the country code (i.e. +91 for IN)
              </p>
            </form>
          )}
          {confirmationResult && (
            <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          )}
        </>
      )}

      {loginMethod === "email" && (
        <form onSubmit={handleEmailLogin}>
          <Input
            className="text-black"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            className="text-black mt-4"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="mt-5">
            Login with Email
          </Button>
        </form>
      )}

      <Button
        disabled={!phoneNumber || isPending || resendCountDown > 0}
        onClick={() => requestOtp()}
        className="mt-5"
      >
        {resendCountDown > 0
          ? `Resend OTP in ${resendCountDown}`
          : isPending
          ? "Sending OTP"
          : "Send OTP"}
      </Button>

      <div className="p-10 text-center">
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </div>

      <div id="recaptcha-container" />

      {isPending && loadingIndicator}
    </div>
  );
}

export default OtpLogin;

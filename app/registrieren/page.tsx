"use client";

import { RegistrationProvider } from "@/app/context/RegistrationContext";
import RegisterFlow from "./RegisterFlow";

export default function RegistrierenPage() {
  return (
    <RegistrationProvider>
      <RegisterFlow />
    </RegistrationProvider>
  );
}

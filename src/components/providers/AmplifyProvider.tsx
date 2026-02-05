"use client";

import { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import amplifyConfig from "@/lib/aws/amplify-config";
import "@aws-amplify/ui-react/styles.css";

export default function AmplifyProvider({ children }: { children: React.ReactNode }) {
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    // Configure Amplify on client-side only
    if (typeof window !== "undefined" && !configured) {
      Amplify.configure(amplifyConfig);
      setConfigured(true);
    }
  }, [configured]);

  if (!configured) {
    return null; // or a loading spinner
  }

  return (
    <Authenticator.Provider>
      {children}
    </Authenticator.Provider>
  );
}
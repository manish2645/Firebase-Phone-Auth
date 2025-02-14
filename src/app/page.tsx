"use client"

import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebaseconfig";
import { signOut } from "firebase/auth";
import Link from "next/link";

export default function Home() {
  const {user} = useAuth();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          {
            user ? (
              <h1 className="text-2xl font-bold">Welcome back, {user?.uid}!</h1>
            ) : (
              <h1 className="text-2xl font-bold">You are not logged in</h1>
            )
          }
          {
            user ?(
              <Button onClick={() => signOut(auth)} className="mt-10">
                Sign Out
              </Button>
            ):(
              <Link href={"/login"}>
                <Button onClick={() => signOut(auth)} className="mt-10">
                  Sign In
                </Button>
              </Link>
            )
          }
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        
      </footer>
    </div>
  );
}

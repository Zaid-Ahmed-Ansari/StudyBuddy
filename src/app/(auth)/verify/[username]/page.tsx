"use client";
// import Input_06 from "@/components/input-06";
import { Button } from "@/components/ui/button";
import {
  Form,
 
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { verifySchema } from "@/src/schemas/verifySchema";
import { ApiResponse } from "@/src/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const VerifyAccount = () => {
  const router = useRouter();
  const params = useParams<{ username: string }>();

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post("/api/verify-code", {
        username: params.username,
        code: data.code,
      });
      toast.success(response.data.message);
      router.replace("/sign-in");
    } catch (error) {
      console.log("Error in signup of user", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || "Error signing up");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg border border-border bg-card text-card-foreground">
        <h1 className="text-2xl font-bold text-center mb-2">
          Verify Your Email
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-6">
          We’ve sent a 6-digit verification code to your email. Enter it below
          to verify your account.
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 transition-all duration-200"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary text-sm">
                    Verification Code
                  </FormLabel>
                  <FormControl>
                    {/* You can style this component however you want */}
                    <Input {...field} className="text-lg tracking-widest" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-accent text-white hover:bg-primary/90 transition"
            >
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default VerifyAccount;

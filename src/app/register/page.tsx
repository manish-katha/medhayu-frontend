'use client';

import React from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-muted/40">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Join Our Community</CardTitle>
          <CardDescription>
            Create your OPDO account to manage your clinic and connect with the Medhayu community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
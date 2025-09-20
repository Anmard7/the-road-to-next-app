'use server';

import { hash } from '@node-rs/argon2';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { PrismaClientKnownRequestError } from '@/generated/prisma/runtime/library';
import { lucia } from '@/lib/lucia';
import { prisma } from '@/lib/prisma';
import { ticketsPath } from '@/path';

const signUpSchema = z
  .object({
    username: z
      .string()
      .min(1, { message: 'Username is required' })
      .max(191, { message: 'Username cannot exceed 191 characters' })
      .refine((value) => !value.includes(' '), {
        message: 'Username cannot have spaces',
      }),
    email: z
      .email({ message: 'Invalid email format' })
      .min(1, { message: 'Email is required' })
      .max(191, { message: 'Email cannot exceed 191 characters' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .max(191, { message: 'Password cannot exceed 191 characters' }),
    confirmPassword: z
      .string()
      .min(6, {
        message: 'Confirm password must be at least 6 characters long',
      })
      .max(191, { message: 'Confirm password cannot exceed 191 characters' }),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

export const signUp = async (_actionState: ActionState, formData: FormData) => {
  try {
    const { username, email, password } = signUpSchema.parse(
      Object.fromEntries(formData.entries()),
    );
    const passwordHash = await hash(password);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      },
    });
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return toActionState(
        'ERROR',
        'Username or email already exists',
        formData,
      );
    }
    return fromErrorToActionState(error, formData);
  }
  redirect(ticketsPath());
};

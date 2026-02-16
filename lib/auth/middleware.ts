import { z } from 'zod';
import {TeamDataWithMembers, User} from '@/lib/db/schema';
import {getTeamForUser, getUser, getUserWithTeam} from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export type ActionState = {
  error?: string|boolean;
  success?: string|boolean;
  [key: string]: any; // This allows for additional properties
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return action(result.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const user = await getUser();
    if (!user) {
      throw new Error('User is not authenticated');
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return action(result.data, formData, user);
  };
}

type ActionWithTeamFunction<T> = (
  formData: FormData,
  team: TeamDataWithMembers
) => Promise<T>;

export function withTeam<T>(action: ActionWithTeamFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    const user = await getUser();
    if (!user) {
      redirect('/sign-in');
    }

    const team = await getTeamForUser();
    if (!team) {
      throw new Error('Team not found');
    }

    return action(formData, team);
  };
}

export function validatedActionWithUserAsync<TInput, TOutput>(
    schema: z.Schema<TInput>,
    action: (data: TInput, user: { id: number }) => Promise<TOutput>
) {
  return async (
      input: TInput | FormData
  ): Promise<ActionState> => {
    try {
      const user = await getUser()
      if (!user) return { success: false, error: 'Not authenticated' }

      let parsedInput: unknown
      if (input instanceof FormData) {
        parsedInput = Object.fromEntries(input.entries())
      } else {
        parsedInput = input
      }

      const validationResult = schema.safeParse(parsedInput)
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors
            .map(e => `${e.path.join('.')}: ${e.message}`)
            .join(', ')
        return { success: false, error: errorMessage }
      }

      const result = await action(validationResult.data, { id: user.id })
      return { success: true, data: result }
    } catch (error) {
      console.error('Action error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      }
    }
  }
}
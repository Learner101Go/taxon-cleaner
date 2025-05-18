import { configValidationSchema } from './configuration';

export function validateEnvironment(env: NodeJS.ProcessEnv) {
  const { error } = configValidationSchema.validate(env, {
    allowUnknown: true,
  });
  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }
}

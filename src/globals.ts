export const IN_DEV = ['development', 'dev'].includes(process.env.NODE_ENV?.toLowerCase());
export const IN_TEST = ['test', 'testing'].includes(process.env.NODE_ENV?.toLowerCase());
export const IN_PROD = ['production', 'prod', 'build'].includes(process.env.NODE_ENV?.toLowerCase());

export const NEXT_URL = process.env.NEXT_PUBLIC_URL;

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

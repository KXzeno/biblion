import { PrismaClient } from "@prisma/client";
import 'dotenv/config';

/**
* @link https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
*/

const prismaClientSingleton = () => {
  return new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

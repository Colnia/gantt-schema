"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
var client_1 = require("@prisma/client");
// PrismaClient är bundet till NodeJS-miljön
// NextJS hot-reload kan skapa flera instanser av PrismaClient i utvecklingsläge
// För att undvika detta, deklarerar vi en global variabel för PrismaClient instansen
// Läs mer: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
var globalForPrisma = global;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        log: ['query'],
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
exports.default = exports.prisma;

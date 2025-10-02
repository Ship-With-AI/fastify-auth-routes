import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { ZodObject } from 'zod'
import type jwt from '@fastify/jwt'

export default fastifyPlugin<{ bodySchema: ZodObject }>(async (fastify: FastifyInstance, opts) => {
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/login",
    {
      schema: {
        body: opts.bodySchema,
      },
    },
    async (req, reply) => {
      try {
        const userId = await fastify.authenticate(req.body);
        const token = fastify.jwt.sign({ id: userId });
        return { token };
      } catch {
        reply.unauthorized("Invalid credentials")
      }
    },
  );
}, {
  decorators: { fastify: ['authenticate'] },
  dependencies: ['@fastify/jwt', '@fastify/sensible'],
  fastify: '5.x'
});

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: (body: unknown) => Promise<string>
    jwt: jwt.JWT
  }
  export interface FastifyReply {
    unauthorized: (msg?: string) => Promise<FastifyReply>
  }
}

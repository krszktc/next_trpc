import { prismaClient } from "../../prisma/prismaClient";
import { inferRouterOutputs, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";

const t = initTRPC.create({
  transformer: superjson,
});

export const trpcRouter = t.router({
  // example endpoint...
  getPosts: t.procedure
    .input(
      z.object({
        pageSize: z.number().default(10),
        cursor: z.number().nullable()
      })
    )
    .query(async ({ ctx, input }) => {
      const { pageSize, cursor } = input;
      const posts = await prismaClient.post.findMany({
        take: pageSize,
        skip: cursor ? 1 : 0,
        select: {
          id: true,
          content: true,
          _count: {
            select: {
              comments: true
            }
          }
        },
        cursor: {
          id: cursor ?? 1
        }
      });

      return posts.map(post => ({
        id: post.id,
        content: post.content,
        commentsCount: post._count.comments,
      }))
    }),
  getComments: t.procedure
    .input(
      z.object({
        postId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { postId } = input;
      return await prismaClient.comment.findMany({
        where: { postId }
      })
    }),
  saveComment: t.procedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { postId, content } = input;
      return await prismaClient.comment.create({
        data: { postId, content }
      })
    })
});

export type TrpcRouter = typeof trpcRouter;

type RouterOutputs = inferRouterOutputs<TrpcRouter>;
type GetPostsModel = RouterOutputs['getPosts'];
type GetCommentsModel = RouterOutputs['getComments'];

export type PostDto = GetPostsModel[number];
export type CommentDto = GetCommentsModel[number];

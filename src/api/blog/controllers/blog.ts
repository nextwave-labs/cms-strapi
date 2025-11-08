"use strict";
/**
 * blog controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::blog.blog",
  ({ strapi }) => ({
    async findOne(ctx) {
      const { slug } = ctx.params;
      const entity = await strapi.db.query("api::blog.blog").findOne({
        where: { slug },

        // Line to populate the relationships
        populate: {
          image: true,
          tags: true,
          author: { populate: { image: true } },
          meta_datum: true,
        },
      });

      entity.author.imageUrl = entity.author.image?.url;
      delete entity.author.image;

      entity.imageUrl = entity.image?.url;
      delete entity.image;

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

      return this.transformResponse(sanitizedEntity);
    },
    async customSearch(ctx) {
      const { search } = ctx.params;
      const arrayOfSearch = search.split("-");

      const entity = await strapi.db.query("api::blog.blog").findMany({
        where: {
          $or: [
            {
              title: { $containsi: arrayOfSearch },
            },
            {
              shortDescription: { $containsi: arrayOfSearch },
            },
            {
              blogData: { $containsi: arrayOfSearch },
            },
          ],
        },
        populate: { tags: true, author: true, image: true },
      });
      for (const blog of entity) {
        blog.imageUrl = blog.image?.url;
        delete blog.image;
      }

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

      return this.transformResponse(sanitizedEntity);
    },
    async find(ctx) {
      const entity = await strapi.db.query("api::blog.blog").findMany({
        // Line to populate the relationships
        populate: {
          image: true,
          tags: true,
          author: { populate: { image: true } },
          meta_datum: true,
        },
        where: {
          publishedAt: {
            $notNull: true,
          },
        },
      });
      for (const blog of entity) {
        blog.imageUrl = blog.image?.url;
        delete blog.image;
      }
      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

      return this.transformResponse(sanitizedEntity);
    },
  })
);

# DropInBlog API Client

[![NPM version](https://img.shields.io/npm/v/@dropinblog/api-client.svg)](https://www.npmjs.com/package/@dropinblog/api-client)
[![License](https://img.shields.io/npm/l/@dropinblog/api-client.svg)](https://github.com/DropInBlog/react-api/blob/main/LICENSE)

A lightweight, zero-dependency, and fully-typed TypeScript client for the [DropInBlog API](https://dropinblog.readme.io/reference/api-reference). This client can be used in any JavaScript or TypeScript project, both on the server (Node.js) and in the browser.

It includes a simple in-memory cache to reduce redundant requests and improve performance.

## Features

- Fully typed with TypeScript
- Works in Node.js and the browser
- Zero dependencies
- Built-in configurable caching
- Simple and intuitive API

## Installation

You can install the package using npm, yarn, or pnpm:

```bash
npm install @dropinblog/api-client
```

## Quick Start

First, you'll need your DropInBlog **Blog ID** and an **API Token**. You can find these in your DropInBlog account settings.

```typescript
import DibApi from '@dropinblog/api-client';

// Initialize the client
const dibApi = new DibApi('YOUR_API_TOKEN', 'YOUR_BLOG_ID');

async function getPosts() {
  try {
    const posts = await dibApi.fetchMainList();
    console.log('Successfully fetched posts:', posts.body_html);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }
}

getPosts();
```

## API Reference

### `new DibApi(token, blogId, cacheTTL?)`

Creates a new API client instance.

- `token` (string): Your DropInBlog API token.
- `blogId` (string): Your DropInBlog Blog ID.
- `cacheTTL` (number, optional): Cache Time-To-Live in milliseconds. Defaults to 5 minutes (`300000`).

---

### Fetching Content

All fetch methods return a `Promise<APIData>`.

#### `fetchMainList({ pagination? })`

Fetches the main list of blog posts.

- `pagination` (string, optional): The page number for pagination.

#### `fetchPost({ slug })`

Fetches a single blog post by its slug.

- `slug` (string): The slug of the post.

#### `fetchCategories({ slug, pagination? })`

Fetches posts belonging to a specific category.

- `slug` (string): The slug of the category.
- `pagination` (string, optional): The page number for pagination.

#### `fetchAuthor({ slug, pagination? })`

Fetches posts by a specific author.

- `slug` (string): The slug of the author.
- `pagination` (string, optional): The page number for pagination.

---

### Fetching Feeds & Sitemaps

#### `fetchSitemap()`

Fetches the XML sitemap for the blog.

#### `fetchBlogFeed()`

Fetches the main RSS feed for the blog.

#### `fetchCategoryFeed({ slug })`

Fetches the RSS feed for a specific category.

- `slug` (string): The slug of the category.

#### `fetchAuthorFeed({ slug })`

Fetches the RSS feed for a specific author.

- `slug` (string): The slug of the author.

## Issues & Contributing

If you encounter any bugs or have a feature request, please open an issue on our GitHub repository.

## License

This project is licensed under the ISC License.

## Links

- [DropInBlog Website](https://dropinblog.com)

- [Documentation](https://dropinblog.readme.io/reference/api-reference)
- [GitHub Repository](https://github.com/DropInBlog/react-api)

export type APIData = {
  body_html?: string;
  head_data?: Record<string, string>;
  content_type?: string;
  slug?: string;
  sitemap?: string;
  feed?: string;
};

type APIResponse = {
  code: number;
  message: string;
  data: APIData;
  locale: string;
  success: boolean;
};

type CacheEntry = {
  data: unknown;
  timestamp: number;
};

export default class DibApi {
  private token: string;
  private blogId: string;
  private cache: Map<string, CacheEntry>;
  private cacheTTL: number; // in milliseconds

  /**
   * Creates an instance of the DibApi client.
   * @param {string} token - The Dropinblog API token.
   * @param {string} blogId - The Dropinblog Blog ID.
   * @param {number} [cacheTTL=300000] - Cache Time To Live in milliseconds (defaults to 5 minutes).
   */
  constructor(
    token: string,
    blogId: string,
    cacheTTL: number = 5 * 60 * 1000 // Default 5 minutes
  ) {
    this.token = token;
    this.blogId = blogId;
    this.cache = new Map();
    this.cacheTTL = cacheTTL;
  }

  private getOptions() {
    return {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${this.token}`,
      },
    };
  }

  private async _fetchAndProcess<T>(
    url: string,
    options: { returnFullResponse: boolean } = { returnFullResponse: false }
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      // For debugging purposes, you can uncomment the line below
      // console.log(`[CACHE HIT] ${url}`);
      return cached.data as T; // Type assertion is safe here due to the generic T
    }
    // console.log(`[CACHE MISS] ${url}`);

    if (!this.token || !this.blogId) {
      throw new Error('Token and Blog ID are required');
    }

    const res = await fetch(url, this.getOptions());
    // The API returns JSON for both success and error cases
    const jsonResponse = await res.json();

    if (res.ok) {
      const dataToReturn = options.returnFullResponse
        ? (jsonResponse as T)
        : ((jsonResponse as APIResponse).data as T);

      // Store in cache
      this.cache.set(url, { data: dataToReturn, timestamp: Date.now() });
      return dataToReturn;
    }

    throw new Error(
      (jsonResponse as APIResponse).message || 'API request failed'
    );
  }

  /**
   * Gets the API token.
   * @returns {string} The API token.
   */
  getToken = () => this.token;
  /**
   * Gets the Blog ID.
   * @returns {string} The Blog ID.
   */
  getBlogId = () => this.blogId;

  /**
   * Fetches the main list of blog posts, with optional pagination.
   * @param {{ pagination?: string }} [options={}] - The options for fetching the main list.
   * @param {string} [options.pagination] - The page number for pagination.
   * @returns {Promise<APIData>} A promise that resolves with the blog post list data.
   */
  fetchMainList = async ({
    pagination,
  }: { pagination?: string } = {}): Promise<APIData> => {
    try {
      const url = `https://api.dropinblog.com/v2/blog/${
        this.blogId
      }/rendered/list?${
        pagination ? `page=${pagination}&` : ''
      }fields=head_data%2Cbody_html`;
      return await this._fetchAndProcess(url);
    } catch (error) {
      console.error('Error fetching main list:', (error as Error).message);
      throw error;
    }
  };

  /**
   * Fetches a single blog post by its slug.
   * @param {{ slug: string }} options - The options for fetching a post.
   * @param {string} options.slug - The slug of the post to fetch.
   * @returns {Promise<APIData>} A promise that resolves with the post data.
   */
  fetchPost = async ({ slug }: { slug: string }): Promise<APIData> => {
    try {
      const url = `https://api.dropinblog.com/v2/blog/${this.blogId}/rendered/post/${slug}?fields=head_data%2Cbody_html`;
      return await this._fetchAndProcess(url);
    } catch (error) {
      console.error('Error fetching post:', (error as Error).message);
      throw error;
    }
  };

  /**
   * Fetches a list of posts for a specific category.
   * @param {{ slug: string, pagination?: string }} options - The options for fetching category posts.
   * @param {string} options.slug - The slug of the category.
   * @param {string} [options.pagination] - The page number for pagination.
   * @returns {Promise<APIData>} A promise that resolves with the category posts data.
   */
  fetchCategories = async ({
    slug,
    pagination,
  }: {
    slug: string;
    pagination?: string;
  }): Promise<APIData> => {
    try {
      const url = `https://api.dropinblog.com/v2/blog/${
        this.blogId
      }/rendered/list/category/${slug}?${
        pagination ? `page=${pagination}&` : ''
      }fields=head_data%2Cbody_html`;
      return await this._fetchAndProcess(url);
    } catch (error) {
      console.error('Error fetching categories:', (error as Error).message);
      throw error;
    }
  };

  /**
   * Fetches a list of posts for a specific author.
   * @param {{ slug: string, pagination?: string }} options - The options for fetching author posts.
   * @param {string} options.slug - The slug of the author.
   * @param {string} [options.pagination] - The page number for pagination.
   * @returns {Promise<APIData>} A promise that resolves with the author posts data.
   */
  fetchAuthor = async ({
    slug,
    pagination,
  }: {
    slug: string;
    pagination?: string;
  }): Promise<APIData> => {
    try {
      const url = `https://api.dropinblog.com/v2/blog/${
        this.blogId
      }/rendered/list/author/${slug}?${
        pagination ? `page=${pagination}&` : ''
      }fields=head_data%2Cbody_html`;
      return await this._fetchAndProcess(url);
    } catch (error) {
      console.error('Error fetching author:', (error as Error).message);
      throw error;
    }
  };

  /**
   * Fetches the sitemap for the blog.
   * @returns {Promise<APIData>} A promise that resolves with the sitemap data.
   */
  fetchSitemap = async (): Promise<APIData> => {
    // Type remains APIData, now it will correctly return APIData
    try {
      const url = `https://api.dropinblog.com/v2/blog/${this.blogId}/rendered/sitemap`;
      return await this._fetchAndProcess(url); // Removed returnFullResponse: true
    } catch (error) {
      console.error('Error fetching sitemap:', (error as Error).message);
      throw error;
    }
  };

  /**
   * Fetches the main RSS feed for the blog.
   * @returns {Promise<APIData>} A promise that resolves with the feed data.
   */
  fetchBlogFeed = async (): Promise<APIData> => {
    try {
      const url = `https://api.dropinblog.com/v2/blog/${this.blogId}/rendered/feed`;
      return await this._fetchAndProcess(url);
    } catch (error) {
      console.error('Error fetching blog feed:', (error as Error).message);
      throw error;
    }
  };

  /**
   * Fetches the RSS feed for a specific category.
   * @param {{ slug: string }} options - The options for fetching the category feed.
   * @param {string} options.slug - The slug of the category.
   * @returns {Promise<APIData>} A promise that resolves with the category feed data.
   */
  fetchCategoryFeed = async ({ slug }: { slug: string }): Promise<APIData> => {
    try {
      const url = `https://api.dropinblog.com/v2/blog/${this.blogId}/rendered/feed/category/${slug}`;
      return await this._fetchAndProcess(url);
    } catch (error) {
      console.error('Error fetching category feed:', (error as Error).message);
      throw error;
    }
  };

  /**
   * Fetches the RSS feed for a specific author.
   * @param {{ slug: string }} options - The options for fetching the author feed.
   * @param {string} options.slug - The slug of the author.
   * @returns {Promise<APIData>} A promise that resolves with the author feed data.
   */
  fetchAuthorFeed = async ({ slug }: { slug: string }): Promise<APIData> => {
    try {
      const url = `https://api.dropinblog.com/v2/blog/${this.blogId}/rendered/feed/author/${slug}`;
      return await this._fetchAndProcess(url);
    } catch (error) {
      console.error('Error fetching author feed:', (error as Error).message);
      throw error;
    }
  };
}

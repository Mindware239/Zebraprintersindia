import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { create } from 'xmlbuilder2';
import dotenv from 'dotenv';
import { getConnection } from './database.js';
import { 
  generateProductUrl, 
  generateCategoryUrl, 
  generateSubcategoryUrl,
  generateBlogUrl, 
  generateJobUrl,
  removeDuplicateUrls 
} from './utils/slugGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: 'process.env' });

class SitemapGenerator {
  constructor() {
    this.baseUrl = 'https://www.zebraprintersindia.com';
    this.maxUrlsPerSitemap = 50000;
    this.sitemapDir = path.join(__dirname, 'public', 'sitemaps');
    this.sitemapIndexPath = path.join(__dirname, 'public', 'sitemap-index.xml');
    this.mainSitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
    
    // Static pages configuration
    this.staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/contact', priority: '0.8', changefreq: 'monthly' },
      { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { url: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
      { url: '/products', priority: '0.9', changefreq: 'weekly' },
      { url: '/drivers', priority: '0.7', changefreq: 'weekly' },
      { url: '/support', priority: '0.7', changefreq: 'weekly' },
      { url: '/blog', priority: '0.6', changefreq: 'weekly' },
      { url: '/search', priority: '0.5', changefreq: 'monthly' }
    ];

    // Use centralized database connection
    this.db = getConnection();
  }

  /**
   * Generate complete sitemap system
   */
  async generateSitemaps() {
    try {
      console.log('🚀 Starting sitemap generation...');
      
      // Ensure sitemap directory exists
      await fs.ensureDir(this.sitemapDir);
      
      // Clean up old sitemap files first
      await this.cleanupOldSitemaps();
      
      // Get all URLs (static + dynamic)
      const allUrls = await this.getAllUrls();
      
      console.log(`📊 Total URLs found: ${allUrls.length}`);
      
      if (allUrls.length === 0) {
        console.log('⚠️  No URLs found, skipping sitemap generation');
        return;
      }

      // Check if we need multiple sitemaps (if URLs exceed limit)
      if (allUrls.length <= this.maxUrlsPerSitemap) {
        // Generate single consolidated sitemap
        console.log('📁 Creating single consolidated sitemap...');
        await this.generateSitemapFile(allUrls, this.mainSitemapPath);
        console.log(`✅ Generated sitemap.xml (${allUrls.length} URLs)`);
        console.log(`📄 Main sitemap: ${this.baseUrl}/sitemap.xml`);
      } else {
        // Split URLs into chunks for multiple sitemaps
        const urlChunks = this.chunkArray(allUrls, this.maxUrlsPerSitemap);
        console.log(`📁 Creating ${urlChunks.length} sitemap files...`);

        // Generate individual sitemap files
        const sitemapFiles = [];
        for (let i = 0; i < urlChunks.length; i++) {
          const chunk = urlChunks[i];
          const sitemapNumber = i + 1;
          
          const fileName = `sitemap-${sitemapNumber}.xml`;
          const sitemapPath = path.join(this.sitemapDir, fileName);
          
          await this.generateSitemapFile(chunk, sitemapPath);
          sitemapFiles.push({
            loc: `${this.baseUrl}/sitemaps/${fileName}`,
            lastmod: new Date().toISOString().split('T')[0]
          });
          
          console.log(`✅ Generated ${fileName} (${chunk.length} URLs)`);
        }

        // Generate sitemap index
        await this.generateSitemapIndex(sitemapFiles);
        console.log(`📄 Sitemap index: ${this.baseUrl}/sitemap-index.xml`);
      }
      
      console.log('🎉 Sitemap generation completed successfully!');
      
    } catch (error) {
      console.error('❌ Error generating sitemaps:', error.message);
      throw error;
    }
  }

  /**
   * Get all URLs (static + dynamic from database)
   */
  async getAllUrls() {
    const urls = [];

    // Add static pages
    for (const page of this.staticPages) {
      urls.push({
        loc: `${this.baseUrl}${page.url}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: page.changefreq,
        priority: page.priority
      });
    }

    // Add dynamic content from database
    try {
      const dynamicUrls = await this.getAllDynamicUrls();
      urls.push(...dynamicUrls);
    } catch (error) {
      console.error('⚠️  Error fetching dynamic URLs from database:', error.message);
      // Continue with static pages only if database fails
    }

    // Remove duplicates and return
    return removeDuplicateUrls(urls);
  }

  /**
   * Get all dynamic URLs from all tables
   */
  async getAllDynamicUrls() {
    const allUrls = [];
    
    // Get URLs from each table with individual error handling
    const urlPromises = [
      this.getProductUrls().catch(err => { console.log('⚠️  Products:', err.message); return []; }),
      this.getCategoryUrls().catch(err => { console.log('⚠️  Categories:', err.message); return []; }),
      this.getSubcategoryUrls().catch(err => { console.log('⚠️  Subcategories:', err.message); return []; }),
      this.getBlogUrls().catch(err => { console.log('⚠️  Blogs:', err.message); return []; }),
      this.getJobUrls().catch(err => { console.log('⚠️  Jobs:', err.message); return []; }),
      this.getDriverUrls().catch(err => { console.log('⚠️  Drivers:', err.message); return []; }),
      this.getBrandUrls().catch(err => { console.log('⚠️  Brands:', err.message); return []; }),
      this.getCityUrls().catch(err => { console.log('⚠️  Cities:', err.message); return []; }),
      this.getStateUrls().catch(err => { console.log('⚠️  States:', err.message); return []; })
    ];

    const results = await Promise.all(urlPromises);
    
    results.forEach(urls => {
      allUrls.push(...urls);
    });

    return allUrls;
  }

  /**
   * Get dynamic pages from pages table (optional)
   */
  async getDynamicPages() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT slug, updated_at 
        FROM pages 
        WHERE slug IS NOT NULL 
        AND slug != '' 
        AND status = 'active'
        ORDER BY updated_at DESC
      `;

      this.db.query(query, (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        const urls = results.map(row => ({
          loc: `${this.baseUrl}/${row.slug}`,
          lastmod: row.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.6'
        }));

        resolve(urls);
      });
    });
  }

  /**
   * Get product URLs from products table
   */
  async getProductUrls() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT name, slug, updated_at 
        FROM products 
        WHERE status = 'active' 
        AND name IS NOT NULL 
        AND name != ''
        ORDER BY updated_at DESC
      `;

      this.db.query(query, (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        const urls = results.map(row => {
          const productUrl = generateProductUrl({ name: row.name, slug: row.slug }, this.baseUrl);
          return {
            loc: productUrl,
            lastmod: row.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.8'
          };
        }).filter(url => url.loc); // Filter out empty URLs

        resolve(urls);
      });
    });
  }

  /**
   * Get category URLs from categories table
   */
  async getCategoryUrls() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT name, created_at 
        FROM categories 
        WHERE name IS NOT NULL 
        AND name != ''
        ORDER BY created_at DESC
      `;

      this.db.query(query, (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        const urls = results.map(row => {
          const categoryUrl = generateCategoryUrl({ name: row.name }, this.baseUrl);
          return {
            loc: categoryUrl,
            lastmod: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: '0.7'
          };
        }).filter(url => url.loc);

        resolve(urls);
      });
    });
  }

  /**
   * Get blog URLs from blogs table
   */
  async getBlogUrls() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT slug, updated_at 
        FROM blogs 
        WHERE status = 'published' 
        AND slug IS NOT NULL 
        AND slug != ''
        ORDER BY updated_at DESC
      `;

      this.db.query(query, (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        const urls = results.map(row => {
          const blogUrl = generateBlogUrl({ slug: row.slug }, this.baseUrl);
          return {
            loc: blogUrl,
            lastmod: row.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: '0.6'
          };
        }).filter(url => url.loc);

        resolve(urls);
      });
    });
  }

  /**
   * Get job URLs from jobs table
   */
  async getJobUrls() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT slug, updated_at 
        FROM jobs 
        WHERE status = 'active' 
        AND slug IS NOT NULL 
        AND slug != ''
        ORDER BY updated_at DESC
      `;

      this.db.query(query, (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        const urls = results.map(row => {
          const jobUrl = generateJobUrl({ slug: row.slug }, this.baseUrl);
          return {
            loc: jobUrl,
            lastmod: row.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.5'
          };
        }).filter(url => url.loc);

        resolve(urls);
      });
    });
  }

  /**
   * Get subcategory URLs from subcategories table with category information
   */
  async getSubcategoryUrls() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT s.name, s.slug, s.created_at, c.name as category_name
        FROM subcategories s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.name IS NOT NULL 
        AND s.name != ''
        AND c.name IS NOT NULL
        ORDER BY s.created_at DESC
      `;

      this.db.query(query, (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        const urls = results.map(row => {
          const subcategoryUrl = generateSubcategoryUrl(
            { name: row.name, slug: row.slug }, 
            row.category_name, 
            this.baseUrl
          );
          return {
            loc: subcategoryUrl,
            lastmod: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: '0.6'
          };
        }).filter(url => url.loc);

        resolve(urls);
      });
    });
  }

  /**
   * Get driver URLs from drivers table
   */
  async getDriverUrls() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT name, created_at 
        FROM drivers 
        WHERE status = 'active' 
        AND name IS NOT NULL 
        AND name != ''
        ORDER BY created_at DESC
      `;

      this.db.query(query, (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        const urls = results.map(row => {
          const slug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const driverUrl = `${this.baseUrl}/drivers/${slug}`;
          return {
            loc: driverUrl,
            lastmod: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: '0.6'
          };
        });

        resolve(urls);
      });
    });
  }

  /**
   * Get brand URLs from brands table
   */
  async getBrandUrls() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT name, slug, created_at 
        FROM brands 
        WHERE status = 'active' 
        AND name IS NOT NULL 
        AND name != ''
        ORDER BY created_at DESC
      `;

      this.db.query(query, (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        const urls = results.map(row => {
          const slug = row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const brandUrl = `${this.baseUrl}/brand/${slug}`;
          return {
            loc: brandUrl,
            lastmod: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: '0.6'
          };
        });

        resolve(urls);
      });
    });
  }

  /**
   * Get city URLs from city table
   */
  async getCityUrls() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT city, state 
        FROM city 
        WHERE city IS NOT NULL 
        AND city != ''
        ORDER BY city ASC
        LIMIT 1000
      `;

      this.db.query(query, (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        const urls = results.map(row => {
          const citySlug = row.city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const cityUrl = `${this.baseUrl}/location/${citySlug}`;
          return {
            loc: cityUrl,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'yearly',
            priority: '0.4'
          };
        });

        resolve(urls);
      });
    });
  }

  /**
   * Get state URLs from states table
   */
  async getStateUrls() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT name, country 
        FROM states 
        WHERE name IS NOT NULL 
        AND name != ''
        ORDER BY name ASC
        LIMIT 1000
      `;

      this.db.query(query, (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        const urls = results.map(row => {
          const stateSlug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const stateUrl = `${this.baseUrl}/state/${stateSlug}`;
          return {
            loc: stateUrl,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'yearly',
            priority: '0.4'
          };
        });

        resolve(urls);
      });
    });
  }

  /**
   * Generate individual sitemap file
   */
  async generateSitemapFile(urls, filePath) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const url of urls) {
      xml += '  <url>\n';
      xml += `    <loc>${url.loc}</loc>\n`;
      
      if (url.lastmod) {
        xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      }
      
      if (url.changefreq) {
        xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      }
      
      if (url.priority) {
        xml += `    <priority>${url.priority}</priority>\n`;
      }
      
      xml += '  </url>\n';
    }

    xml += '</urlset>\n';
    await fs.writeFile(filePath, xml, 'utf8');
  }

  /**
   * Generate sitemap index file
   */
  async generateSitemapIndex(sitemapFiles) {
    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('sitemapindex', {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
      });

    for (const sitemap of sitemapFiles) {
      const sitemapElement = root.ele('sitemap');
      sitemapElement.ele('loc').txt(sitemap.loc);
      sitemapElement.ele('lastmod').txt(sitemap.lastmod);
    }

    const xml = root.end({ pretty: true });
    await fs.writeFile(this.sitemapIndexPath, xml, 'utf8');
  }

  /**
   * Split array into chunks
   */
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Clean up old sitemap files
   */
  async cleanupOldSitemaps() {
    try {
      // Clean up sitemap directory files
      const files = await fs.readdir(this.sitemapDir);
      const sitemapFiles = files.filter(file => 
        (file.startsWith('sitemap-') && file.endsWith('.xml')) || 
        file === 'sitemap.xml'
      );
      
      for (const file of sitemapFiles) {
        await fs.remove(path.join(this.sitemapDir, file));
      }
      
      // Clean up main sitemap.xml file
      if (await fs.pathExists(this.mainSitemapPath)) {
        await fs.remove(this.mainSitemapPath);
      }
      
      // Clean up sitemap index
      if (await fs.pathExists(this.sitemapIndexPath)) {
        await fs.remove(this.sitemapIndexPath);
      }
      
      console.log(`🧹 Cleaned up ${sitemapFiles.length + 2} old sitemap files`);
    } catch (error) {
      console.error('⚠️  Error cleaning up old sitemaps:', error.message);
    }
  }

  /**
   * Close database connection
   */
  closeConnection() {
    if (this.db) {
      this.db.end();
    }
  }
}

// Export for use in other modules
export default SitemapGenerator;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new SitemapGenerator();
  
  generator.generateSitemaps()
    .then(() => {
      console.log('✅ Sitemap generation completed');
      generator.closeConnection();
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Sitemap generation failed:', error.message);
      generator.closeConnection();
      process.exit(1);
    });
}

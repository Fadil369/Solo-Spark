// 🌟 Cloudflare Service Integration for Solo-Spark
// TypeScript service for integrating with Cloudflare APIs

export interface CloudflareConfig {
  accountId: string;
  apiToken: string;
  zoneId: string;
  kvNamespaces: {
    userData: string;
    sessions: string;
    cache: string;
    analytics: string;
  };
  r2Buckets: {
    userFiles: string;
    prototypes: string;
    exports: string;
    backups: string;
  };
  d1DatabaseId: string;
  workerUrls: {
    auth: string;
    api: string;
    queue: string;
  };
}

export class CloudflareService {
  private config: CloudflareConfig;
  private baseUrl = 'https://api.cloudflare.com/client/v4';

  constructor(config: CloudflareConfig) {
    this.config = config;
  }

  // ===== KV STORAGE OPERATIONS =====

  async kvGet(namespace: keyof CloudflareConfig['kvNamespaces'], key: string): Promise<string | null> {
    const namespaceId = this.config.kvNamespaces[namespace];

    try {
      const response = await fetch(
        `${this.baseUrl}/accounts/${this.config.accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
          },
        }
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`KV get failed: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error('KV get error:', error);
      throw error;
    }
  }

  async kvPut(namespace: keyof CloudflareConfig['kvNamespaces'], key: string, value: string, ttl?: number): Promise<void> {
    const namespaceId = this.config.kvNamespaces[namespace];

    const formData = new FormData();
    formData.append('value', value);
    if (ttl) {
      formData.append('expiration_ttl', ttl.toString());
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/accounts/${this.config.accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`KV put failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('KV put error:', error);
      throw error;
    }
  }

  async kvDelete(namespace: keyof CloudflareConfig['kvNamespaces'], key: string): Promise<void> {
    const namespaceId = this.config.kvNamespaces[namespace];

    try {
      const response = await fetch(
        `${this.baseUrl}/accounts/${this.config.accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
          },
        }
      );

      if (!response.ok && response.status !== 404) {
        throw new Error(`KV delete failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('KV delete error:', error);
      throw error;
    }
  }

  // ===== R2 STORAGE OPERATIONS =====

  async r2Upload(bucket: keyof CloudflareConfig['r2Buckets'], key: string, file: File | Blob, metadata?: Record<string, string>): Promise<string> {
    const bucketName = this.config.r2Buckets[bucket];

    try {
      // Get upload URL
      const uploadUrlResponse = await fetch(
        `${this.baseUrl}/accounts/${this.config.accountId}/r2/buckets/${bucketName}/objects/${key}/upload-url`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ metadata }),
        }
      );

      if (!uploadUrlResponse.ok) {
        throw new Error(`Failed to get upload URL: ${uploadUrlResponse.statusText}`);
      }

      const { uploadUrl } = await uploadUrlResponse.json();

      // Upload file
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`File upload failed: ${uploadResponse.statusText}`);
      }

      return `https://cdn.brainsait.io/${bucket}/${key}`;
    } catch (error) {
      console.error('R2 upload error:', error);
      throw error;
    }
  }

  async r2Download(bucket: keyof CloudflareConfig['r2Buckets'], key: string): Promise<Blob> {
    const bucketName = this.config.r2Buckets[bucket];

    try {
      const response = await fetch(
        `${this.baseUrl}/accounts/${this.config.accountId}/r2/buckets/${bucketName}/objects/${key}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`R2 download failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('R2 download error:', error);
      throw error;
    }
  }

  async r2Delete(bucket: keyof CloudflareConfig['r2Buckets'], key: string): Promise<void> {
    const bucketName = this.config.r2Buckets[bucket];

    try {
      const response = await fetch(
        `${this.baseUrl}/accounts/${this.config.accountId}/r2/buckets/${bucketName}/objects/${key}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
          },
        }
      );

      if (!response.ok && response.status !== 404) {
        throw new Error(`R2 delete failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('R2 delete error:', error);
      throw error;
    }
  }

  // ===== D1 DATABASE OPERATIONS =====

  async d1Query(query: string, params: any[] = []): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/accounts/${this.config.accountId}/d1/database/${this.config.d1DatabaseId}/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sql: query,
            params,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`D1 query failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.result;
    } catch (error) {
      console.error('D1 query error:', error);
      throw error;
    }
  }

  // ===== WORKER COMMUNICATION =====

  async callWorker(worker: keyof CloudflareConfig['workerUrls'], path: string, options: RequestInit = {}): Promise<Response> {
    const workerUrl = this.config.workerUrls[worker];

    try {
      const response = await fetch(`${workerUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      return response;
    } catch (error) {
      console.error('Worker call error:', error);
      throw error;
    }
  }

  // ===== ANALYTICS =====

  async getAnalytics(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/zones/${this.config.zoneId}/analytics/dashboard?since=${startDate}&until=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Analytics fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Analytics error:', error);
      throw error;
    }
  }

  // ===== QUEUE OPERATIONS =====

  async sendToQueue(queueName: string, messages: any[]): Promise<void> {
    try {
      const response = await this.callWorker('queue', '/send', {
        method: 'POST',
        body: JSON.stringify({
          queue: queueName,
          messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Queue send failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Queue send error:', error);
      throw error;
    }
  }

  // ===== CACHE OPERATIONS =====

  async purgeCache(urls?: string[]): Promise<void> {
    try {
      const body = urls ? { files: urls } : { purge_everything: true };

      const response = await fetch(
        `${this.baseUrl}/zones/${this.config.zoneId}/purge_cache`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error(`Cache purge failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Cache purge error:', error);
      throw error;
    }
  }

  // ===== SECURITY OPERATIONS =====

  async updateSecurityLevel(level: 'off' | 'essentially_off' | 'low' | 'medium' | 'high' | 'under_attack'): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/zones/${this.config.zoneId}/settings/security_level`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            value: level,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Security level update failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Security level update error:', error);
      throw error;
    }
  }
}

// ===== UTILITY FUNCTIONS =====

export const createCloudflareService = (config: Partial<CloudflareConfig>): CloudflareService => {
  const defaultConfig: CloudflareConfig = {
    accountId: process.env.VITE_CLOUDFLARE_ACCOUNT_ID || '',
    apiToken: process.env.VITE_CLOUDFLARE_API_TOKEN || '',
    zoneId: process.env.VITE_CLOUDFLARE_ZONE_ID || '',
    kvNamespaces: {
      userData: process.env.VITE_KV_USER_DATA_ID || '',
      sessions: process.env.VITE_KV_SESSIONS_ID || '',
      cache: process.env.VITE_KV_CACHE_ID || '',
      analytics: process.env.VITE_KV_ANALYTICS_ID || '',
    },
    r2Buckets: {
      userFiles: process.env.VITE_R2_USER_FILES_BUCKET || 'solo-spark-user-files',
      prototypes: process.env.VITE_R2_PROTOTYPES_BUCKET || 'solo-spark-prototypes',
      exports: process.env.VITE_R2_EXPORTS_BUCKET || 'solo-spark-exports',
      backups: process.env.VITE_R2_BACKUPS_BUCKET || 'solo-spark-backups',
    },
    d1DatabaseId: process.env.VITE_D1_DATABASE_ID || '',
    workerUrls: {
      auth: process.env.VITE_WORKER_AUTH_URL || 'https://auth.brainsait.io',
      api: process.env.VITE_WORKER_API_URL || 'https://api.brainsait.io',
      queue: process.env.VITE_WORKER_QUEUE_URL || 'https://queue.brainsait.io',
    },
  };

  const mergedConfig = { ...defaultConfig, ...config };
  return new CloudflareService(mergedConfig);
};

// Export singleton instance
export const cloudflare = createCloudflareService({});

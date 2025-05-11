// src/lib/rate-limit.ts
type RateLimitRecord = {
    timestamp: number;
    count: number;
  };
  
  const rateLimitMap = new Map<string, RateLimitRecord>();
  
  export function rateLimit(ip: string, limit = 5, interval = 60 * 1000) {
    const now = Date.now();
    const record = rateLimitMap.get(ip);
  
    if (!record || now - record.timestamp > interval) {
      // Reset if expired or new
      rateLimitMap.set(ip, { timestamp: now, count: 1 });
      return { success: true };
    }
  
    if (record.count < limit) {
      record.count += 1;
      rateLimitMap.set(ip, record);
      return { success: true };
    }
  
    return { success: false };
  }
  
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);
  
  // Log if this is a refresh request
  if (url.includes('/refresh')) {
    console.log(`🔄 REFRESH REQUEST DETECTED`);
    console.log(`   Headers:`, JSON.stringify(req.headers, null, 2));
    console.log(`   Cookies:`, req.cookies);
  }
  
  next();
};

module.exports = requestLogger;
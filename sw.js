import { createHelia } from 'helia';
import { verifiedFetch } from '@helia/verified-fetch';

let helia;
let vfetch;
// Store the Trusted CID for use in subsequent requests without cid parameter
let storedTrustedCid = null;

// Initialize Helia IPFS node
async function initHelia() {
  if (!helia) {
    helia = await createHelia();
    vfetch = verifiedFetch; // await createVerifiedFetch(helia);
  }
  return { helia, vfetch };
}

// Determine content type from path
function getContentType(path) {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const types = {
    'html': 'text/html',
    'js': 'application/javascript',
    'css': 'text/css',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'svg': 'image/svg+xml',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
  };
  return types[ext] || 'application/octet-stream';
}

// Inject VERIFIED status into HTML
function injectVerifiedStatus(htmlContent) {
  // Inject meta tag and data attribute to indicate verified status
  const verifiedMeta = '<meta name="verified-frontend" content="VERIFIED">';
  const verifiedDataAttr = ' data-verified="VERIFIED"';
  
  // CSS for verified badge
  const verifiedStyle = `
    <style>
      .verified-badge {
        position: fixed;
        top: 10px;
        right: 10px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .verified-badge::before {
        content: '✓';
        background: white;
        color: #10b981;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
      }
    </style>
  `;
  
  // Verified badge HTML
  const verifiedBadge = '<div class="verified-badge">VERIFIED</div>';
  
  // Try to inject meta tag and style before </head> tag
  let modified = htmlContent;
  if (modified.includes('</head>')) {
    modified = modified.replace('</head>', `${verifiedMeta}\n${verifiedStyle}</head>`);
  } else {
    modified = `${verifiedMeta}\n${verifiedStyle}${modified}`;
  }
  
  // Inject data attribute into html tag
  if (modified.includes('<html')) {
    modified = modified.replace(/<html([^>]*)>/, `<html$1${verifiedDataAttr}>`);
  }
  
  // Inject verified badge into body (before closing body tag or at the beginning)
  if (modified.includes('</body>')) {
    modified = modified.replace('</body>', `${verifiedBadge}\n</body>`);
  } else if (modified.includes('<body')) {
    // If no closing body tag, inject after opening body tag
    modified = modified.replace(/<body([^>]*)>/, `<body$1>${verifiedBadge}`);
  } else {
    // If no body tag, append at the end
    modified = `${modified}${verifiedBadge}`;
  }
  
  return modified;
}

// Handle verified fetch request
async function handleVerifiedFetch(request) {
  try {
    await initHelia();
    
    const url = new URL(request.url);
    
    // Extract Trusted CID from query parameter, or use stored CID as fallback
    let trustedCid = url.searchParams.get('cid');
    
    if (trustedCid) {
      // Store the CID for future requests without the parameter
      storedTrustedCid = trustedCid;
      console.log('Stored Trusted CID:', trustedCid);
    } else if (storedTrustedCid) {
      // Use stored CID if query parameter is missing
      trustedCid = storedTrustedCid;
      console.log('Using stored Trusted CID:', trustedCid);
    } else {
      // No CID available - return error
      return new Response('Missing Trusted CID. Please load the page with ?cid= parameter first.', { status: 400 });
    }
    
    // Construct IPFS path: /ipfs/[CID][URL Path]
    const urlPath = url.pathname === '/' ? '/index.html' : url.pathname;
    const ipfsPath = `ipfs://${trustedCid}${urlPath}`;
    
    // Use @helia/verified-fetch to retrieve the asset
    let response = null;
    try {
        response = await vfetch(ipfsPath);
    } catch (error) {
        console.error('Verified fetch error:', error);
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
    
    if (!response.ok) {
      return new Response(`IPFS fetch failed: ${response.statusText}`, { 
        status: response.status 
      });
    }
    
    // Get the content type based on file extension
    const contentType = getContentType(urlPath);
    
    // Get the response body
    const body = await response.arrayBuffer();
    
    // Handle Content-Type headers and inject VERIFIED status for HTML files only
    if (contentType === 'text/html') {
      const htmlText = new TextDecoder().decode(body);
      const verifiedHtml = injectVerifiedStatus(htmlText);
      const verifiedBody = new TextEncoder().encode(verifiedHtml);
      
      return new Response(verifiedBody, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
    
    // For non-HTML files, return as-is with proper content type
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Verified fetch error:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

// Service Worker Install
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Service Worker Activate
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Intercept fetch requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle GET requests within the scope
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and external non-scope requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Skip bootloader.html - it needs to load normally to register the service worker
  if (url.pathname === '/bootloader.html' || url.pathname.endsWith('/bootloader.html')) {
    return;
  }
  
  // Skip config.json - bootloader needs to fetch it normally
  if (url.pathname === '/config.json' || url.pathname.endsWith('/config.json')) {
    return;
  }
  
  // Skip sw.bundle.js - service worker registration needs it to load normally
  if (url.pathname === '/sw.bundle.js' || url.pathname.endsWith('/sw.bundle.js')) {
    return;
  }
  
  // Handle all other requests within scope using verified fetch
  event.respondWith(handleVerifiedFetch(event.request));
});

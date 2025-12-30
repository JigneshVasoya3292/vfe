# Verifiable Frontend (VFE) DApp

A decentralized web application that removes dependency on CDNs and centralized servers by serving content directly from IPFS using a service worker. The application implements the **Bootloader Pattern** to ensure verifiable content delivery through ENS domain resolution.

## Features

- ✅ **Decentralized Content Delivery** - All assets served from IPFS, no CDN dependencies
- ✅ **ENS Domain Support** - Resolve ENS names to IPFS CIDs
- ✅ **Service Worker Verification** - Content integrity verified using Helia's verified-fetch
- ✅ **Bootloader Pattern** - Ensures service worker is active before loading main app
- ✅ **Visual Verification Badge** - UI indicator showing verified content status
- ✅ **Trustless Architecture** - Content verified by hash, no trust in servers required

## Architecture

### Bootloader Pattern

The application uses a bootloader that:
1. Reads ENS parameter from URL
2. Resolves ENS name to IPFS CID via `config.json`
3. Registers the service worker (`sw.bundle.js`)
4. Waits for service worker activation
5. Navigates to main app with Trusted CID parameter

### Service Worker

The service worker (`sw.js`) intercepts all requests and:
- Extracts Trusted CID from query parameter (or uses stored CID)
- Fetches content from IPFS using `@helia/verified-fetch`
- Verifies content integrity automatically
- Injects verification status into HTML responses
- Serves all assets (HTML, JS, CSS, images) from IPFS

### Technology Stack

- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Helia** - IPFS implementation for browsers
- **@helia/verified-fetch** - Trustless content fetching
- **Ethers.js** - Ethereum/ENS integration

## Setup

### Prerequisites

- Node.js 18+ (or Node.js 22+ for full compatibility)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

## Development

### Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
# Build main application
npm run build

# Build service worker only
npm run build:sw

# Build everything
npm run build:all
```

### Preview Production Build

```bash
npm run preview
```

## Usage

### Local Development

1. Start the dev server: `npm run dev`
2. Access the bootloader: `http://localhost:3000/bootloader.html?ens=poc.eth`
3. The bootloader will:
   - Resolve `poc.eth` to IPFS CID from `config.json`
   - Register service worker
   - Navigate to main app with CID parameter

### Production Deployment

1. Build the application:
   ```bash
   npm run build:all
   ```

2. Deploy the `dist/` folder to a web server

3. Ensure `config.json` is accessible at the root

4. Access via bootloader:
   ```
   https://yourdomain.com/bootloader.html?ens=yourname.eth
   ```

## Configuration

### ENS to IPFS Mapping

Edit `config.json` to map ENS names to IPFS CIDs:

```json
{
  "poc.eth": "bafybeidxaxrkq7qhwebuldof5ag5ogpbj3xm6zqltagop27jewzan7zw7y",
  "yourname.eth": "QmYourCIDHere"
}
```

### Service Worker Scope

The service worker is registered with scope `/` and intercepts all requests within that scope, except:
- `bootloader.html` - Loads normally to register SW
- `config.json` - Loads normally for ENS resolution
- `sw.bundle.js` - Loads normally for registration

## How It Works

### Request Flow

1. **Initial Request**: `bootloader.html?ens=poc.eth`
   - Bootloader loads normally (not intercepted)
   - Fetches `config.json` to resolve ENS → CID
   - Registers service worker

2. **Service Worker Activation**
   - Service worker becomes active
   - Claims all clients

3. **Main App Navigation**: `index.html?cid=Qm...`
   - Service worker intercepts request
   - Extracts CID from query parameter
   - Stores CID for subsequent requests
   - Fetches from IPFS using verified-fetch
   - Injects verification badge into HTML

4. **Asset Requests**: `/assets/main.js`, `/assets/style.css`
   - Service worker intercepts (no CID in URL)
   - Uses stored CID from step 3
   - Fetches from IPFS using verified-fetch
   - Returns verified content

### Verification Process

- All content is fetched using `@helia/verified-fetch`
- Content integrity is verified by comparing hashes
- HTML responses are injected with:
  - Meta tag: `<meta name="verified-frontend" content="VERIFIED">`
  - Data attribute: `data-verified="VERIFIED"` on `<html>` tag
  - Visual badge: Green "VERIFIED" indicator in top-right corner

## Project Structure

```
vfe/
├── bootloader.html      # Bootloader that registers SW and navigates to app
├── sw.js                 # Service worker source code
├── sw.bundle.js          # Bundled service worker (built)
├── config.json           # ENS name to IPFS CID mapping
├── index.html            # Main app entry point
├── src/
│   ├── main.ts          # Application entry point
│   ├── App.ts            # Main app component
│   ├── index.css         # Global styles
│   └── ensResolver.ts    # ENS resolution utilities
├── vite.config.ts        # Main Vite configuration
├── vite.sw.config.ts     # Service worker build configuration
└── dist/                 # Production build output
```

## Testing

### Test Helia Verified Fetch

Open `test-helia.html` in a browser to test IPFS fetching functionality.

### Service Worker Testing

1. Build service worker: `npm run build:sw`
2. Open browser DevTools → Application → Service Workers
3. Verify service worker is registered and active
4. Check Network tab to see requests being intercepted

## Troubleshooting

### Service Worker Not Registering

- Ensure `sw.bundle.js` is accessible at root
- Check browser console for registration errors
- Verify service worker scope matches your deployment

### Assets Not Loading

- Ensure CID is stored correctly (check first request has `?cid=` parameter)
- Verify IPFS CID is valid and content exists
- Check browser console for fetch errors

### Verification Badge Not Showing

- Rebuild service worker: `npm run build:sw`
- Clear browser cache and reload
- Verify HTML injection is working in Network tab

## Security Considerations

- **Content Integrity**: All content is verified by hash comparison
- **Trustless**: No trust in servers required - content verified cryptographically
- **No CDN Dependencies**: All assets served from IPFS, eliminating CDN attack vectors
- **ENS Resolution**: Can be extended to use on-chain ENS resolution for production

## Future Enhancements

- [ ] On-chain ENS resolution via ethers.js
- [ ] IPNS support for dynamic content
- [ ] Content caching strategies
- [ ] Offline support
- [ ] Multiple CID support per ENS name

## License



## Contributing




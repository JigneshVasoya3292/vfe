import { BrowserProvider, Contract, namehash, ZeroAddress } from 'ethers';

const ENS_RESOLVER_ABI = [
  'function contenthash(bytes32 node) external view returns (bytes memory)',
] as const;

const ENS_REGISTRY_ABI = [
  'function resolver(bytes32 node) external view returns (address)',
] as const;

const ENS_REGISTRY_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';

export async function resolveENSToIPFS(ensName: string, provider: BrowserProvider): Promise<string | null> {
  try {
    const registry = new Contract(ENS_REGISTRY_ADDRESS, ENS_REGISTRY_ABI, provider);
    const node = namehash(ensName);
    const resolverAddress = await registry.resolver(node);
    
    if (!resolverAddress || resolverAddress === ZeroAddress) {
      return null;
    }
    
    const resolver = new Contract(resolverAddress, ENS_RESOLVER_ABI, provider);
    const contenthash = await resolver.contenthash(node);
    
    // Parse contenthash (IPFS hashes start with 0xe3010170)
    if (contenthash.startsWith('0xe3010170')) {
      // Extract CID from contenthash
      // In production, properly decode using multiformats
      const cidBytes = contenthash.slice(10); // Remove 0xe3010170 prefix
      return cidBytes;
    }
    
    return null;
  } catch (error) {
    console.error('ENS resolution error:', error);
    return null;
  }
}

export async function resolveENSFromConfig(ensName: string): Promise<string | null> {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    return config[ensName] || null;
  } catch (error) {
    console.error('Config resolution error:', error);
    return null;
  }
}


import { ethers } from 'ethers';

export function App(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900';

  const content = document.createElement('div');
  content.className = 'container mx-auto px-4 py-16';

  const title = document.createElement('h1');
  title.className = 'text-5xl font-bold text-white text-center mb-8';
  title.textContent = 'VFE DApp';

  const card = document.createElement('div');
  card.className = 'max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20';

  const statusDiv = document.createElement('div');
  statusDiv.id = 'status';
  statusDiv.className = 'mb-6 p-4 bg-white/5 rounded-lg text-white text-center';
  statusDiv.textContent = 'Not connected';

  const connectBtn = document.createElement('button');
  connectBtn.id = 'connectBtn';
  connectBtn.className = 'w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg';
  connectBtn.textContent = 'Connect Wallet';

  const accountDiv = document.createElement('div');
  accountDiv.id = 'account';
  accountDiv.className = 'mt-6 p-4 bg-white/5 rounded-lg text-white text-sm break-all hidden';

  const balanceDiv = document.createElement('div');
  balanceDiv.id = 'balance';
  balanceDiv.className = 'mt-4 p-4 bg-white/5 rounded-lg text-white text-sm hidden';

  card.appendChild(statusDiv);
  card.appendChild(connectBtn);
  card.appendChild(accountDiv);
  card.appendChild(balanceDiv);

  content.appendChild(title);
  content.appendChild(card);
  container.appendChild(content);

  let provider: ethers.BrowserProvider | null = null;
  let signer: ethers.JsonRpcSigner | null = null;

  connectBtn.addEventListener('click', async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        statusDiv.textContent = 'Please install MetaMask!';
        statusDiv.className = 'mb-6 p-4 bg-red-500/20 rounded-lg text-white text-center border border-red-500/50';
        return;
      }

      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);

      statusDiv.textContent = 'Connected';
      statusDiv.className = 'mb-6 p-4 bg-green-500/20 rounded-lg text-white text-center border border-green-500/50';

      accountDiv.textContent = `Account: ${address}`;
      accountDiv.classList.remove('hidden');

      balanceDiv.textContent = `Balance: ${ethers.formatEther(balance)} ETH`;
      balanceDiv.classList.remove('hidden');

      connectBtn.textContent = 'Disconnect';
      connectBtn.className = 'w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg';
    } catch (error) {
      statusDiv.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      statusDiv.className = 'mb-6 p-4 bg-red-500/20 rounded-lg text-white text-center border border-red-500/50';
    }
  });

  return container;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}


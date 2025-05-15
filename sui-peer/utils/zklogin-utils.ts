import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { jwtToAddress } from '@mysten/zklogin';
import { REDIRECT_URI, GOOGLE_CLIENT_ID } from '@/constants/sui';

// Generate a random string for state parameter
export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Generate a nonce for zkLogin
export function generateNonce(): string {
  return Math.floor(Math.random() * 1000000000).toString();
}

// Generate an ephemeral keypair for zkLogin
export function generateEphemeralKeypair(): Ed25519Keypair {
  return new Ed25519Keypair();
}

// Store the ephemeral keypair in session storage
export function storeEphemeralKeypair(keypair: Ed25519Keypair): void {
  const privateKey = Buffer.from(keypair.getSecretKey()).toString('hex');
  sessionStorage.setItem('zkLogin:ephemeralPrivateKey', privateKey);
}

// Retrieve the ephemeral keypair from session storage
export function retrieveEphemeralKeypair(): Ed25519Keypair | null {
  const privateKeyHex = sessionStorage.getItem('zkLogin:ephemeralPrivateKey');
  if (!privateKeyHex) return null;
  
  try {
    const privateKey = Uint8Array.from(Buffer.from(privateKeyHex, 'hex'));
    return Ed25519Keypair.fromSecretKey(privateKey);
  } catch (error) {
    console.error('Error retrieving ephemeral keypair:', error);
    return null;
  }
}

// Generate the OAuth URL for Google
export function generateGoogleOAuthUrl(keypair: Ed25519Keypair): { url: string, nonce: string, state: string } {
  // Generate state and nonce
  const state = generateRandomString(32);
  const nonce = generateNonce();
  
  // Store state and nonce in session storage
  sessionStorage.setItem('zkLogin:stateString', state);
  sessionStorage.setItem('zkLogin:nonce', nonce);
  
  // Construct the OAuth URL
  const oauthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  oauthUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
  oauthUrl.searchParams.append('response_type', 'id_token');
  oauthUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  oauthUrl.searchParams.append('scope', 'openid email profile');
  oauthUrl.searchParams.append('state', state);
  oauthUrl.searchParams.append('nonce', nonce);
  oauthUrl.searchParams.append('prompt', 'select_account');
  
  return {
    url: oauthUrl.toString(),
    nonce,
    state
  };
}

// Process the JWT token to derive the Sui address
export function processJwt(jwt: string, nonce: string): string {
  try {
    // Parse the JWT to extract user information
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    // Decode the payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Derive the Sui address from the JWT
    const userAddr = jwtToAddress(jwt, nonce);
    
    return userAddr;
  } catch (error) {
    console.error('Error processing JWT:', error);
    throw new Error('Failed to process JWT token');
  }
}

// Store zkLogin data in session storage
export function storeZkLoginData(address: string, jwt: string): void {
  sessionStorage.setItem('zkLogin:address', address);
  sessionStorage.setItem('zkLogin:jwt', jwt);
}

// Clear zkLogin data from session storage
export function clearZkLoginData(): void {
  sessionStorage.removeItem('zkLogin:address');
  sessionStorage.removeItem('zkLogin:jwt');
  sessionStorage.removeItem('zkLogin:ephemeralPrivateKey');
  sessionStorage.removeItem('zkLogin:stateString');
  sessionStorage.removeItem('zkLogin:nonce');
}

// Generate a mock address for development purposes
export function generateMockAddress(): string {
  const prefix = '0x';
  const characters = 'abcdef0123456789';
  let result = prefix;
  for (let i = 0; i < 64; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
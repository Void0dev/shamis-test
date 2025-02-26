import { TonApiClient } from '@ton-api/client';
 
const ta = new TonApiClient({
  baseUrl: import.meta.env.VITE_TESTNET ? 'https://testnet.tonapi.io' : 'https://tonapi.io',
});
 
export default ta;

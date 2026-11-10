export interface PoojaService {
  id: number;
  name: string;
  description: string;
  /** Duration in minutes. */
  duration: number;
  /** Price in Indian rupees, as returned by the backend. */
  price: number;
}

export interface PoojaCatalogResponse {
  poojas: PoojaService[];
}

function isPooja(value: unknown): value is PoojaService {
  if (typeof value !== 'object' || value === null) return false;
  const pooja = value as Record<string, unknown>;
  return (
    Number.isInteger(pooja.id) &&
    typeof pooja.name === 'string' &&
    typeof pooja.description === 'string' &&
    Number.isInteger(pooja.duration) &&
    typeof pooja.price === 'number' &&
    Number.isFinite(pooja.price)
  );
}

export async function fetchPoojas(signal: AbortSignal): Promise<PoojaService[]> {
  // Expo replaces this direct property access with the public environment value.
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (!baseUrl) throw new Error('The pooja catalog is not configured yet.');

  const url = new URL(baseUrl);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    ['localhost', '127.0.0.1', '0.0.0.0', '[::1]'].includes(url.hostname) ||
    url.username ||
    url.password
  ) {
    throw new Error('Configure a reachable backend address without credentials.');
  }

  const requestUrl = `${baseUrl.replace(/\/+$/, '')}/api/mobile/poojas`;
  if (__DEV__) console.info('[Pooja catalog] GET', requestUrl);

  const response = await fetch(requestUrl, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (__DEV__) {
    console.info('[Pooja catalog] Response', {
      status: response.status,
      contentType: response.headers.get('content-type'),
    });
  }
  if (!response.ok) throw new Error(`Pooja catalog request failed: HTTP ${response.status}.`);

  const data: unknown = await response.json();
  if (
    typeof data !== 'object' ||
    data === null ||
    !('poojas' in data) ||
    !Array.isArray(data.poojas) ||
    !data.poojas.every(isPooja)
  ) {
    throw new Error(
      'Invalid catalog response: expected { poojas: [...] } with numeric id, duration, price and string name, description.'
    );
  }

  const catalog: PoojaCatalogResponse = { poojas: data.poojas };
  if (__DEV__) console.info('[Pooja catalog] Loaded services:', catalog.poojas.length);
  return catalog.poojas;
}

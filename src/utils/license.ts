import * as SecureStore from 'expo-secure-store';

const PREFIX = 'DAGANGI';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LICENSE_STATUS_KEY = 'license_status';
const LICENSE_KEY_KEY = 'license_key';
const ACTIVATED_AT_KEY = 'activated_at';

export type LicenseInfo = {
  license_status: 'Aktif' | 'Tidak Aktif';
  license_key: string | null;
  activated_at: string | null;
};

export function normalizeSerial(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

export function validateSerial(value: string) {
  const serial = normalizeSerial(value);
  const match = serial.match(/^DAGANGI-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/);
  if (!match) return false;

  const body = `${match[1]}${match[2]}${match[3]}`;
  if (![...body].every((char) => ALPHABET.includes(char))) return false;

  const payload = body.slice(0, 10);
  const check = body.slice(10);
  return check === checksum(payload);
}

export async function getLicenseInfo(): Promise<LicenseInfo> {
  const [status, key, activatedAt] = await Promise.all([
    SecureStore.getItemAsync(LICENSE_STATUS_KEY),
    SecureStore.getItemAsync(LICENSE_KEY_KEY),
    SecureStore.getItemAsync(ACTIVATED_AT_KEY),
  ]);
  return {
    license_status: status === 'Aktif' ? 'Aktif' : 'Tidak Aktif',
    license_key: key,
    activated_at: activatedAt,
  };
}

export async function isActivated() {
  const info = await getLicenseInfo();
  return info.license_status === 'Aktif' && !!info.license_key && validateSerial(info.license_key);
}

export async function activateLicense(serialInput: string) {
  const serial = normalizeSerial(serialInput);
  if (!validateSerial(serial)) {
    throw new Error('Serial number tidak valid');
  }
  const activatedAt = new Date().toISOString();
  await Promise.all([
    SecureStore.setItemAsync(LICENSE_STATUS_KEY, 'Aktif'),
    SecureStore.setItemAsync(LICENSE_KEY_KEY, serial),
    SecureStore.setItemAsync(ACTIVATED_AT_KEY, activatedAt),
  ]);
  return {
    license_status: 'Aktif',
    license_key: serial,
    activated_at: activatedAt,
  } satisfies LicenseInfo;
}

export async function resetLicenseForDev() {
  await Promise.all([
    SecureStore.deleteItemAsync(LICENSE_STATUS_KEY),
    SecureStore.deleteItemAsync(LICENSE_KEY_KEY),
    SecureStore.deleteItemAsync(ACTIVATED_AT_KEY),
  ]);
}

export function maskSerial(serial: string | null) {
  if (!serial) return '-';
  const normalized = normalizeSerial(serial);
  const parts = normalized.split('-');
  if (parts.length !== 4) return normalized;
  return `${parts[0]}-${parts[1]}-****-****`;
}

export function formatActivatedAt(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('id-ID');
}

function checksum(payload: string) {
  let hash = 2166136261;
  for (const char of `${PREFIX}-${payload}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  const first = hash % ALPHABET.length;
  const second = Math.floor(hash / ALPHABET.length) % ALPHABET.length;
  return `${ALPHABET[first]}${ALPHABET[second]}`;
}

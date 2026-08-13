import Constants from 'expo-constants';
import { Platform } from 'react-native';

export enum Environment {
  LOCAL = 'LOCAL',
  HOMOLOGA = 'HOMOLOGA',
  PROD = 'PROD',
}

// Troque manualmente para alternar de ambiente em dev local (npx expo run:android,
// expo start, etc). Builds do EAS com profile preview/production ignoram isso — ver
// forceEnvironmentFromEasProfile() abaixo, para nunca subir um build de loja apontando
// pro ambiente errado por esquecimento.
const CURRENT_ENVIRONMENT: Environment = Environment.LOCAL;

// No Android, 'localhost' aponta pro próprio device/emulador, não pra máquina rodando o
// backend — então reaproveitamos o host que o Metro já usa pra servir o bundle
// (Constants.expoConfig.hostUri), que funciona tanto em emulador quanto em device físico.
// Cai pra 10.0.2.2 (alias do emulador Android pro host) só se o hostUri não estiver disponível.
const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];

const LOCAL_BASE_URL = Platform.select({
  android: `http://${metroHost ?? '10.0.2.2'}:3000`,
  default: 'http://localhost:3000',
});

const BASE_URL_BY_ENVIRONMENT: Record<Environment, string> = {
  [Environment.LOCAL]: LOCAL_BASE_URL,
  [Environment.HOMOLOGA]: 'https://api.vortely.com',
  [Environment.PROD]: 'https://api.vortely.com',
};

// eas.json injeta EXPO_PUBLIC_APP_ENV=development/preview/production por profile.
// Só forçamos o ambiente para os profiles de build de loja (preview/production);
// qualquer outro valor (development, local, ou a variável ausente em dev local)
// deixa CURRENT_ENVIRONMENT no controle.
function forceEnvironmentFromEasProfile(): Environment | undefined {
  const easProfile = process.env.EXPO_PUBLIC_APP_ENV?.trim().toLowerCase();

  if (easProfile === 'production') {
    return Environment.PROD;
  }

  if (easProfile === 'preview') {
    return Environment.HOMOLOGA;
  }

  return undefined;
}

function returnBaseUrl(): string {
  const environment = forceEnvironmentFromEasProfile() ?? CURRENT_ENVIRONMENT;
  return BASE_URL_BY_ENVIRONMENT[environment];
}

export const environments = {
  current: CURRENT_ENVIRONMENT,
  returnBaseUrl,
};

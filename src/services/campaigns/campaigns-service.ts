/**
 * Campaigns Service — Mock implementation.
 *
 * When the back-end is ready, replace each method body with an `api.get(...)` call.
 * The signatures and return types stay the same, so the consuming components won't need changes.
 *
 * To test the error state: set SIMULATE_ERROR = true.
 */

import type {
  Campaign,
  CampaignCategory,
  CampaignDetail,
  CampaignFilters,
  Institution,
  InstitutionDetail,
  InstitutionFilters,
} from './campaigns-types';

// ─── Dev flags ────────────────────────────────────────────────────────────────
const SIMULATE_ERROR = false;
const MOCK_DELAY_MS = 800;

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    title: 'Material Escolar 2026',
    institution: 'Educação Viva',
    institutionId: 'inst-1',
    category: 'Educação',
    goalFormatted: 'R$ 5.000',
    raisedFormatted: 'R$ 3.200',
    goalCents: 500000,
    raisedCents: 320000,
    progress: 64,
    active: true,
    endsAt: '2026-07-31',
  },
  {
    id: '2',
    title: 'Cestas de Inverno',
    institution: 'Lar Aconchego',
    institutionId: 'inst-2',
    category: 'Alimentação',
    goalFormatted: 'R$ 8.000',
    raisedFormatted: 'R$ 5.600',
    goalCents: 800000,
    raisedCents: 560000,
    progress: 70,
    active: true,
    endsAt: '2026-08-15',
  },
  {
    id: '3',
    title: 'Mutirão de Saúde Comunitária',
    institution: 'Saúde Para Todos',
    institutionId: 'inst-3',
    category: 'Saúde',
    goalFormatted: 'R$ 3.000',
    raisedFormatted: 'R$ 900',
    goalCents: 300000,
    raisedCents: 90000,
    progress: 30,
    active: true,
    endsAt: '2026-09-01',
  },
  {
    id: '4',
    title: 'Reflorestamento Urbano',
    institution: 'Verde Futuro',
    institutionId: 'inst-4',
    category: 'Meio Ambiente',
    goalFormatted: 'R$ 12.000',
    raisedFormatted: 'R$ 7.200',
    goalCents: 1200000,
    raisedCents: 720000,
    progress: 60,
    active: true,
    endsAt: '2026-10-20',
  },
  {
    id: '5',
    title: 'Reforma do Abrigo',
    institution: 'Casa Esperança',
    institutionId: 'inst-5',
    category: 'Moradia',
    goalFormatted: 'R$ 20.000',
    raisedFormatted: 'R$ 4.000',
    goalCents: 2000000,
    raisedCents: 400000,
    progress: 20,
    active: true,
    endsAt: '2026-12-31',
  },
  {
    id: '6',
    title: 'Reforço Escolar Inclusivo',
    institution: 'Educação Viva',
    institutionId: 'inst-1',
    category: 'Educação',
    goalFormatted: 'R$ 2.500',
    raisedFormatted: 'R$ 2.500',
    goalCents: 250000,
    raisedCents: 250000,
    progress: 100,
    active: false,
  },
];

const MOCK_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-1',
    name: 'Educação Viva',
    category: 'Educação',
    city: 'São Paulo',
    state: 'SP',
    activeCampaigns: 2,
    verified: true,
    description: 'Promovemos acesso à educação de qualidade para crianças em situação de vulnerabilidade.',
  },
  {
    id: 'inst-2',
    name: 'Lar Aconchego',
    category: 'Alimentação',
    city: 'Curitiba',
    state: 'PR',
    activeCampaigns: 1,
    verified: true,
    description: 'Distribuímos cestas básicas e refeições para famílias em insegurança alimentar.',
  },
  {
    id: 'inst-3',
    name: 'Saúde Para Todos',
    category: 'Saúde',
    city: 'Belo Horizonte',
    state: 'MG',
    activeCampaigns: 1,
    verified: false,
    description: 'Oferecemos atendimento médico gratuito em comunidades de periferia.',
  },
  {
    id: 'inst-4',
    name: 'Verde Futuro',
    category: 'Meio Ambiente',
    city: 'Florianópolis',
    state: 'SC',
    activeCampaigns: 1,
    verified: true,
    description: 'Iniciativas de reflorestamento e educação ambiental no sul do Brasil.',
  },
  {
    id: 'inst-5',
    name: 'Casa Esperança',
    category: 'Moradia',
    city: 'Porto Alegre',
    state: 'RS',
    activeCampaigns: 1,
    verified: false,
    description: 'Auxiliamos famílias sem moradia com reforma e construção de casas populares.',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function matchSearch(fields: string[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => f.toLowerCase().includes(q));
}

// ─── Service ──────────────────────────────────────────────────────────────────
async function listCampaigns(filters: CampaignFilters = {}): Promise<Campaign[]> {
  await delay(MOCK_DELAY_MS);

  if (SIMULATE_ERROR) {
    throw new Error('Erro simulado: falha ao carregar campanhas.');
  }

  const { search = '', category = 'Todos' } = filters;

  return MOCK_CAMPAIGNS.filter((c) => {
    const matchesCategory =
      category === 'Todos' || (c.category as CampaignCategory | 'Todos') === category;
    const matchesSearch = matchSearch([c.title, c.institution, c.category], search);
    return matchesCategory && matchesSearch;
  });
}

async function listInstitutions(filters: InstitutionFilters = {}): Promise<Institution[]> {
  await delay(MOCK_DELAY_MS);

  if (SIMULATE_ERROR) {
    throw new Error('Erro simulado: falha ao carregar instituições.');
  }

  const { search = '' } = filters;

  return MOCK_INSTITUTIONS.filter((inst) =>
    matchSearch([inst.name, inst.category, inst.city, inst.description], search)
  );
}

// ─── Detail data (fields not needed in lists) ─────────────────────────────────
const CAMPAIGN_DETAILS: Record<string, Omit<CampaignDetail, keyof Campaign>> = {
  '1': {
    description:
      'A campanha visa fornecer material escolar completo — cadernos, lápis, mochila e uniforme — para 200 crianças de escolas públicas de periferia. Cada kit custa R$ 25,00 e garante que a criança chegue ao primeiro dia de aula preparada.',
    donorsCount: 128,
    itemsNeeded: ['Cadernos', 'Lápis e borracha', 'Mochila', 'Uniforme escolar', 'Régua e compasso'],
  },
  '2': {
    description:
      'Distribuímos cestas básicas durante o inverno para famílias em situação de insegurança alimentar. Cada cesta abastece uma família de 4 pessoas por 30 dias.',
    donorsCount: 224,
    itemsNeeded: ['Arroz 5kg', 'Feijão 2kg', 'Óleo 900ml', 'Macarrão', 'Extrato de tomate', 'Leite em pó'],
  },
  '3': {
    description:
      'Organizamos um mutirão de saúde com triagem, vacinação e consultas médicas gratuitas para 500 moradores de comunidades sem acesso ao sistema de saúde público.',
    donorsCount: 36,
  },
  '4': {
    description:
      'Plantamos árvores nativas em áreas urbanas degradadas de Florianópolis. Cada R$ 3,00 plantam uma árvore. Nossa meta é de 4.000 árvores ao longo de 6 meses.',
    donorsCount: 288,
    itemsNeeded: ['Mudas nativas', 'Adubo orgânico', 'Luvas de jardinagem', 'Ferramentas'],
  },
  '5': {
    description:
      'Reformamos o abrigo municipal de Porto Alegre, que atende 80 famílias em situação de rua. As obras incluem telhado, pintura, hidráulica e instalação elétrica.',
    donorsCount: 48,
    itemsNeeded: ['Telhas', 'Tinta', 'Material hidráulico', 'Mão de obra voluntária'],
  },
  '6': {
    description:
      'Programa de reforço escolar inclusivo para crianças com dificuldades de aprendizagem. Já atendemos 150 alunos. Campanha encerrada com meta atingida!',
    donorsCount: 100,
  },
};

const INSTITUTION_DETAILS: Record<
  string,
  Omit<InstitutionDetail, keyof Institution | 'campaigns'>
> = {
  'inst-1': { foundedYear: 2010, email: 'contato@educacaoviva.org.br', website: 'https://educacaoviva.org.br' },
  'inst-2': { foundedYear: 2015, email: 'contato@laraconchego.org.br' },
  'inst-3': { foundedYear: 2018, email: 'saude@saudeparatodos.org.br', website: 'https://saudeparatodos.org.br' },
  'inst-4': { foundedYear: 2019, email: 'verde@verdefuturo.eco.br', website: 'https://verdefuturo.eco.br' },
  'inst-5': { foundedYear: 2012, email: 'contato@casaesperanca.org.br' },
};

async function getCampaignById(id: string): Promise<CampaignDetail> {
  await delay(MOCK_DELAY_MS);

  if (SIMULATE_ERROR) {
    throw new Error('Erro simulado: falha ao carregar a campanha.');
  }

  const base = MOCK_CAMPAIGNS.find((c) => c.id === id);
  if (!base) {
    throw new Error(`Campanha "${id}" não encontrada.`);
  }

  const detail = CAMPAIGN_DETAILS[id];
  return { ...base, ...detail };
}

async function getInstitutionById(id: string): Promise<InstitutionDetail> {
  await delay(MOCK_DELAY_MS);

  if (SIMULATE_ERROR) {
    throw new Error('Erro simulado: falha ao carregar a instituição.');
  }

  const base = MOCK_INSTITUTIONS.find((i) => i.id === id);
  if (!base) {
    throw new Error(`Instituição "${id}" não encontrada.`);
  }

  const detail = INSTITUTION_DETAILS[id];
  const campaigns = MOCK_CAMPAIGNS.filter((c) => c.institutionId === id);
  return { ...base, ...detail, campaigns };
}

export const campaignsService = {
  listCampaigns,
  listInstitutions,
  getCampaignById,
  getInstitutionById,
};


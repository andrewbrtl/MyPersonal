export type Professional = {
  id: string;
  nome: string;
  iniciais: string;
  especialidade: string;
  modalidades: string[];
  bairro: string;
  atendimento: string;
  preco: number;
  unidade: string;
  nota: number;
  avaliacoes: number;
  verificado: boolean;
  destaque: string;
  bio: string;
  experiencia: string;
  formacao: string[];
  horarios: string[];
  cor: string;
};

export const professionals: Professional[] = [
  {
    id: "marina-silva",
    nome: "Marina Silva",
    iniciais: "MS",
    especialidade: "Funcional e musculação",
    modalidades: ["Musculação", "Funcional", "Mobilidade"],
    bairro: "Bairro dos Estados",
    atendimento: "Presencial",
    preco: 80,
    unidade: "por aula",
    nota: 5,
    avaliacoes: 24,
    verificado: true,
    destaque: "Treinos para ganhar força sem deixar a mobilidade de lado.",
    bio: "Trabalho com pessoas que querem criar uma rotina de treino possível de manter. Cada plano parte do nível atual, do tempo disponível e dos objetivos de cada aluno.",
    experiencia: "8 anos de experiência",
    formacao: ["Educação Física — Unicentro", "CREF ativo", "Especialização em treinamento funcional"],
    horarios: ["Segunda e quarta · 06h às 11h", "Terça e quinta · 17h às 21h", "Sábado · 08h às 12h"],
    cor: "bg-[#d9653b]",
  },
  {
    id: "carlos-eduardo",
    nome: "Carlos Eduardo",
    iniciais: "CE",
    especialidade: "Assessoria de corrida",
    modalidades: ["Corrida", "Condicionamento"],
    bairro: "Parque do Lago",
    atendimento: "Presencial e online",
    preco: 150,
    unidade: "por mês",
    nota: 4.9,
    avaliacoes: 18,
    verificado: true,
    destaque: "Planilhas e acompanhamento para quem está começando ou quer evoluir.",
    bio: "Ajudo corredores amadores a treinar com constância e menos risco de lesão. O acompanhamento combina planilha, encontros presenciais e ajustes semanais.",
    experiencia: "6 anos de experiência",
    formacao: ["Educação Física — Unicentro", "CREF ativo", "Formação em treinamento de endurance"],
    horarios: ["Terça e quinta · 06h às 09h", "Quarta · 18h às 21h", "Domingo · treinos coletivos"],
    cor: "bg-[#557469]",
  },
  {
    id: "amanda-costa",
    nome: "Amanda Costa",
    iniciais: "AC",
    especialidade: "Yoga e mobilidade",
    modalidades: ["Yoga", "Mobilidade", "Alongamento"],
    bairro: "Vila Bela",
    atendimento: "Presencial e online",
    preco: 100,
    unidade: "por aula",
    nota: 5,
    avaliacoes: 32,
    verificado: true,
    destaque: "Práticas para melhorar mobilidade, consciência corporal e bem-estar.",
    bio: "As aulas são adaptadas para diferentes corpos e níveis de experiência. O foco é construir autonomia, mobilidade e uma prática que caiba na rotina.",
    experiencia: "9 anos de experiência",
    formacao: ["Formação em Hatha Yoga", "Especialização em mobilidade", "Primeiros socorros"],
    horarios: ["Segunda e quarta · 07h às 10h", "Terça e quinta · 18h às 21h", "Aulas online sob consulta"],
    cor: "bg-[#b59662]",
  },
  {
    id: "rafael-mendes",
    nome: "Rafael Mendes",
    iniciais: "RM",
    especialidade: "Boxe e condicionamento",
    modalidades: ["Boxe", "Funcional"],
    bairro: "Santa Cruz",
    atendimento: "Presencial",
    preco: 75,
    unidade: "por aula",
    nota: 4.8,
    avaliacoes: 15,
    verificado: false,
    destaque: "Boxe para iniciantes com técnica, preparo físico e treino no seu ritmo.",
    bio: "Aulas de boxe para quem quer aprender a modalidade ou melhorar o condicionamento, sempre com progressão técnica e atenção individual.",
    experiencia: "5 anos de experiência",
    formacao: ["Educação Física", "Curso de treinador de boxe"],
    horarios: ["Segunda a sexta · 18h às 22h", "Sábado · 09h às 12h"],
    cor: "bg-[#273d37]",
  },
];

export const modalities = [
  ["Musculação", "Força e hipertrofia"],
  ["Corrida", "Rua e performance"],
  ["Funcional", "Mobilidade e condicionamento"],
  ["Lutas", "Boxe, muay thai e jiu-jitsu"],
  ["Yoga e pilates", "Controle e bem-estar"],
  ["Futebol", "Técnica e preparação física"],
  ["Natação", "Técnica e resistência"],
  ["Outros esportes", "Encontre a sua modalidade"],
] as const;

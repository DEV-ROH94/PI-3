-- 1. Tabela de Assistidos (Pessoas atendidas)
CREATE TABLE IF NOT EXISTS public.assistidos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome text NOT NULL,
    cpf text,
    rg text,
    nis text,
    data_nascimento date,
    endereco text,
    telefone text,
    email text,
    responsavel_familiar text,
    composicao_familiar jsonb DEFAULT '[]'::jsonb,
    situacao_trabalho text,
    renda_familiar text,
    escolaridade text,
    condicoes_moradia text,
    beneficios_sociais text,
    status text DEFAULT 'Ativo',
    user_id uuid
);

-- 2. Tabela de Prontuários (Registros de atendimento)
CREATE TABLE IF NOT EXISTS public.prontuarios (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    assistido_id uuid REFERENCES public.assistidos(id) ON DELETE CASCADE,
    assistido_nome text NOT NULL,
    status text DEFAULT 'Ativo',
    risco_social text DEFAULT 'Baixo',
    assistente_nome text,
    assistente_cress text,
    data_entrada date DEFAULT CURRENT_DATE,
    motivo_atendimento text,
    historico_social text,
    avaliacao_tecnica text,
    plano_objetivos text,
    plano_acoes text,
    plano_encaminhamentos text,
    evolucao jsonb DEFAULT '[]'::jsonb,
    articulacao_rede jsonb DEFAULT '[]'::jsonb,
    documentos_anexos jsonb DEFAULT '{}'::jsonb,
    encerramento_data date,
    encerramento_motivo text,
    encerramento_sintese text,
    observacoes text,
    user_id uuid
);

-- 3. Tabela de Atividades
CREATE TABLE IF NOT EXISTS public.atividades (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    tipo text,
    detalhe text,
    status text,
    user_id uuid
);

-- Habilitar RLS
ALTER TABLE public.assistidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (Permitir acesso total para simplificar o desenvolvimento)
-- Importante: Em produção, estas regras devem ser mais restritivas.
DROP POLICY IF EXISTS "Enable all for all" ON public.assistidos;
CREATE POLICY "Public full access" ON public.assistidos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read for all" ON public.prontuarios;
DROP POLICY IF EXISTS "Enable insert for all" ON public.prontuarios;
DROP POLICY IF EXISTS "Enable update for all" ON public.prontuarios;
DROP POLICY IF EXISTS "Enable delete for all" ON public.prontuarios;
DROP POLICY IF EXISTS "Enable all for all" ON public.prontuarios;

CREATE POLICY "Public full access" ON public.prontuarios FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read for all" ON public.atividades;
DROP POLICY IF EXISTS "Enable insert for all" ON public.atividades;
DROP POLICY IF EXISTS "Enable update for all" ON public.atividades;
DROP POLICY IF EXISTS "Enable delete for all" ON public.atividades;
DROP POLICY IF EXISTS "Enable all for all" ON public.atividades;

CREATE POLICY "Public full access" ON public.atividades FOR ALL USING (true) WITH CHECK (true);

-- 4. Tabela de Notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info',
    read boolean DEFAULT false,
    user_id uuid
);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access" ON public.notificacoes FOR ALL USING (true) WITH CHECK (true);

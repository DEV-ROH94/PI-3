-- SQL para criar as tabelas no Supabase (Cole no SQL Editor do Supabase)

-- 1. Tabela de Prontuários
CREATE TABLE IF NOT EXISTS public.prontuarios (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    assistido_nome text NOT NULL,
    status text DEFAULT 'Ativo',
    risco_social text DEFAULT 'Baixo',
    assistente_nome text,
    data_entrada date DEFAULT CURRENT_DATE,
    observacoes text,
    user_id uuid REFERENCES auth.users(id)
);

-- 2. Tabela de Atividades
CREATE TABLE IF NOT EXISTS public.atividades (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    tipo text,
    detalhe text,
    status text,
    user_id uuid REFERENCES auth.users(id)
);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Segurança (O usuário só vê o que ele criou)
CREATE POLICY "Usuarios podem ver seus proprios prontuarios" ON public.prontuarios
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem ver suas proprias atividades" ON public.atividades
    FOR ALL USING (auth.uid() = user_id);

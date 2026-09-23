-- 1. Organizations
CREATE TABLE organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    name text NOT NULL,
    owner_user_id uuid NOT NULL REFERENCES auth.users(id)
);

-- 2. Agents
CREATE TABLE agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    slug text NOT NULL UNIQUE,
    name text NOT NULL,
    state text NOT NULL DEFAULT 'draft',
);

-- 3. Knowledge Sources
CREATE TABLE knowledge_sources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    origin text NOT NULL,
    version integer NOT NULL DEFAULT 1,
    content text NOT NULL
);

-- 4. Knowledge Chunks
CREATE TABLE knowledge_chunks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    source_id uuid NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
    agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    chunk_index integer NOT NULL,
    text text NOT NULL,
    reference text
);

-- 5. Indexes (Todas as Foreign Keys)
CREATE INDEX idx_organizations_owner_user_id ON organizations(owner_user_id);
CREATE INDEX idx_agents_organization_id ON agents(organization_id);
CREATE INDEX idx_knowledge_sources_agent_id ON knowledge_sources(agent_id);
CREATE INDEX idx_knowledge_chunks_source_id ON knowledge_chunks(source_id);
CREATE INDEX idx_knowledge_chunks_agent_id ON knowledge_chunks(agent_id);

-- 6. Enable RLS (Por padrão, bloqueia todo o acesso sem policies explícitas)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;



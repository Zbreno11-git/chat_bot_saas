ALTER TABLE agents 
ADD COLUMN instructions TEXT NOT NULL DEFAULT '',
ADD CONSTRAINT chk_agents_state CHECK (state IN ('draft', 'published', 'disabled'));

ALTER TABLE knowledge_sources
    ADD COLUMN visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    ADD CONSTRAINT uq_knowledge_sources_agent_origin UNIQUE (agent_id, origin);

ALTER TABLE knowledge_chunks
    RENAME COLUMN text TO body;
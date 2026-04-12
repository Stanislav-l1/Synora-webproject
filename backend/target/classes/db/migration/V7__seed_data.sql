-- V7: Seed data — базовые теги + дефолтные настройки

INSERT INTO tags (name, color) VALUES
    ('Java',       '#B07219'),
    ('Spring',     '#6DB33F'),
    ('Python',     '#3572A5'),
    ('JavaScript', '#F1E05A'),
    ('TypeScript', '#3178C6'),
    ('React',      '#61DAFB'),
    ('Next.js',    '#000000'),
    ('PostgreSQL', '#336791'),
    ('Docker',     '#2496ED'),
    ('Kubernetes', '#326CE5'),
    ('DevOps',     '#EE0000'),
    ('Go',         '#00ADD8'),
    ('Rust',       '#DEA584'),
    ('Web',        '#E34F26'),
    ('Mobile',     '#A4C639'),
    ('AI/ML',      '#FF6F00'),
    ('Security',   '#FF0000'),
    ('Open Source','#28A745'),
    ('Career',     '#6F42C1'),
    ('Tutorial',   '#17A2B8')
ON CONFLICT (name) DO NOTHING;

-- Дефолтные колонки Kanban — будут копироваться при создании проекта
-- (вставляются через application code, это просто пример)

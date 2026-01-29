-- ChaiBuilder Create App SQL Script
-- Replace 'YOUR_USER_ID' with your actual user UUID before running this script

-- Generate a new app key (UUID) and set your user ID
WITH data_values AS (
    SELECT 
        gen_random_uuid() AS new_row_id,        -- The app key
        'YOUR_USER_ID'::text AS app_creator_id, -- Your hardcoded user UUID
        'en'::text AS fallback_lang,            -- Change to your preferred language code
        'My ChaiBuilder App'::text AS project_name -- Change to your project name
),

-- Insert into apps table
app_insert AS (
    INSERT INTO apps (id, name, "user", theme, "fallbackLang")
    SELECT 
        new_row_id,
        project_name,
        app_creator_id,
        '{"fontFamily":{"heading":"Inter","body":"Inter"},"borderRadius":"6px","colors":{"background":["#FFFFFF","#09090B"],"foreground":["#09090B","#FFFFFF"],"primary":["#2563EB","#3B82F6"],"primary-foreground":["#FFFFFF","#FFFFFF"],"secondary":["#F4F4F5","#27272A"],"secondary-foreground":["#09090B","#FFFFFF"],"muted":["#F4F4F5","#27272A"],"muted-foreground":["#71717A","#A1A1AA"],"accent":["#F4F4F5","#27272A"],"accent-foreground":["#09090B","#FFFFFF"],"destructive":["#EF4444","#7F1D1D"],"destructive-foreground":["#FFFFFF","#FFFFFF"],"border":["#E4E4E7","#27272A"],"input":["#E4E4E7","#27272A"],"ring":["#2563EB","#3B82F6"],"card":["#FFFFFF","#09090B"],"card-foreground":["#09090B","#FFFFFF"],"popover":["#FFFFFF","#09090B"],"popover-foreground":["#09090B","#FFFFFF"]}}'::jsonb,
        fallback_lang
    FROM data_values
    RETURNING id
),
-- Insert into apps_online table
apps_online_insert AS (
    INSERT INTO apps_online (id, name, "user", "apiKey")
    SELECT 
        ai.id,
        dv.project_name,
        dv.app_creator_id,
        ai.id
    FROM app_insert ai
    CROSS JOIN data_values dv
    RETURNING id
),
-- Insert into libraries table
library_insert AS (
    INSERT INTO libraries (name, app, type)
    SELECT 
        dv.project_name,
        ai.id,
        'default'
    FROM app_insert ai
    RETURNING id, app
),
-- Insert into app_users table
app_users_insert AS (
    INSERT INTO app_users ("user", app, role)
    SELECT 
        dv.app_creator_id,
        ai.id,
        'admin'
    FROM app_insert ai
    CROSS JOIN data_values dv
    RETURNING app
),
-- Insert into app_pages table
page_insert AS (
    INSERT INTO app_pages (app, slug, name, "pageType")
    SELECT 
        ai.id,
        '/',
        'Home',
        'page'
    FROM app_insert ai
    RETURNING id, app
)
-- Display the app key
SELECT 
    ai.id AS app_key,
    'CHAIBUILDER_APP_KEY=' || ai.id AS env_variable,
    'Add this to your .env file' AS instruction
FROM app_insert ai;

<?php

namespace Database\Seeders;

use App\Models\Badge;
use App\Models\Challenge;
use App\Models\EnvironmentalLegalGuide;
use App\Models\EnvironmentalNews;
use App\Models\EnvironmentalOrganization;
use App\Models\Incident;
use App\Models\LearningResource;
use App\Models\User;
use App\Models\UserSavedHubItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin EcoConnect',
            'email' => 'admin@ecoconnect.cm',
            'password' => Hash::make('Admin@2025!'),
            'profile_type' => 'admin',
            'country' => 'CM',
            'points' => 9999,
        ]);

        $emma = User::create([
            'name' => 'Emma Ngono',
            'email' => 'emma@ecoconnect.cm',
            'password' => Hash::make('Demo@2025!'),
            'profile_type' => 'citizen',
            'country' => 'CM',
            'region' => 'Centre',
            'points' => 1250,
        ]);

        $badges = [
            ['name' => 'Welcome', 'slug' => 'welcome', 'description' => 'Bienvenue sur EcoConnect', 'icon' => 'seedling', 'condition' => 'welcome', 'condition_value' => 1, 'points_reward' => 50],
            ['name' => 'First Report', 'slug' => 'first_report', 'description' => 'Premier signalement', 'icon' => 'map-pin', 'condition' => 'incident_reported', 'condition_value' => 1, 'points_reward' => 100],
            ['name' => 'Reporter', 'slug' => 'reporter', 'description' => '5 signalements valides', 'icon' => 'flame', 'condition' => 'reports_5', 'condition_value' => 5, 'points_reward' => 200],
            ['name' => 'Water Guard', 'slug' => 'water_guard', 'description' => 'Gardien des eaux', 'icon' => 'waves', 'condition' => 'reports_10', 'condition_value' => 10, 'points_reward' => 300],
            ['name' => 'Tree Hero', 'slug' => 'tree_hero', 'description' => 'Heros des forets', 'icon' => 'tree-pine', 'condition' => 'challenges_5', 'condition_value' => 5, 'points_reward' => 250],
            ['name' => 'Eco Champion', 'slug' => 'eco_champion', 'description' => 'Champion ecologique', 'icon' => 'trophy', 'condition' => 'points_5000', 'condition_value' => 5000, 'points_reward' => 500],
        ];

        foreach ($badges as $badge) {
            Badge::create($badge);
        }

        $emma->badges()->attach(Badge::where('slug', 'welcome')->first()->id, ['earned_at' => now()]);
        $admin->badges()->attach(Badge::where('slug', 'welcome')->first()->id, ['earned_at' => now()]);

        $challenges = [
            ['title' => 'Reduce Plastic', 'description' => 'Avoid plastic for 3 days', 'icon' => 'recycle', 'type' => 'daily', 'goal_value' => 3, 'goal_unit' => 'days', 'points_reward' => 70, 'starts_at' => now(), 'ends_at' => now()->addDays(7)],
            ['title' => 'Recycle Challenge', 'description' => 'Recycle 5 items this week', 'icon' => 'trash-2', 'type' => 'weekly', 'goal_value' => 5, 'goal_unit' => 'items', 'points_reward' => 50, 'starts_at' => now(), 'ends_at' => now()->addDays(7)],
            ['title' => 'Plant a Tree', 'description' => 'Plant a tree this week', 'icon' => 'tree-pine', 'type' => 'weekly', 'goal_value' => 1, 'goal_unit' => 'trees', 'points_reward' => 120, 'starts_at' => now(), 'ends_at' => now()->addDays(7)],
            ['title' => 'Community Clean', 'description' => 'Organize a community cleaning', 'icon' => 'users', 'type' => 'community', 'goal_value' => 1, 'goal_unit' => 'events', 'points_reward' => 200, 'starts_at' => now(), 'ends_at' => now()->addDays(30)],
        ];

        foreach ($challenges as $challenge) {
            Challenge::create($challenge);
        }

        $incidents = [
            ['type' => 'fire', 'description' => 'Forest fire detected near Bafoussam area', 'latitude' => 5.48, 'longitude' => 10.42, 'location_name' => 'Bafoussam, West Region', 'risk_level' => 'high', 'status' => 'validated'],
            ['type' => 'pollution', 'description' => 'Water pollution in Wouri river, oil spill visible', 'latitude' => 4.05, 'longitude' => 9.70, 'location_name' => 'Douala, Littoral', 'risk_level' => 'medium', 'status' => 'validated'],
            ['type' => 'deforestation', 'description' => 'Illegal logging near Dja Reserve', 'latitude' => 3.10, 'longitude' => 12.80, 'location_name' => 'Dja, South Region', 'risk_level' => 'critical', 'status' => 'validated'],
        ];

        foreach ($incidents as $incident) {
            Incident::create([...$incident, 'user_id' => $emma->id, 'country' => 'CM']);
        }

        $resources = [
            ['title' => 'Biodiversity: The richness of our planet', 'description' => 'Learn about African biodiversity', 'type' => 'article', 'category' => 'biodiversity', 'level' => 'beginner', 'duration_minutes' => 15],
            ['title' => 'Practical Guide to Zero Waste', 'description' => 'Reduce your waste step by step', 'type' => 'guide', 'category' => 'waste', 'level' => 'intermediate', 'duration_minutes' => 30],
            ['title' => 'Understanding Climate Change', 'description' => 'Climate science explained simply', 'type' => 'video', 'category' => 'climate', 'level' => 'beginner', 'duration_minutes' => 20],
            ['title' => 'EcoPodcast: Weekly debates', 'description' => 'Environmental discussions in Africa', 'type' => 'podcast', 'category' => 'general', 'level' => 'intermediate', 'duration_minutes' => 45],
        ];

        foreach ($resources as $resource) {
            LearningResource::create([...$resource, 'is_published' => true]);
        }

        $newsItems = [
            [
                'title' => 'Veille pluies intenses et risques d inondation',
                'summary' => 'Surveille les bulletins officiels, evite les zones basses et signale rapidement les drains obstrues ou les berges fragilisees.',
                'type' => 'Alerte climatique',
                'region' => 'Cameroun',
                'source' => 'World Meteorological Organization',
                'source_url' => 'https://wmo.int/',
                'published_at' => now()->subDays(1),
                'priority' => 'high',
                'tags' => ['climat', 'alerte', 'prevention'],
            ],
            [
                'title' => 'Biodiversite forestiere: surveiller les corridors ecologiques',
                'summary' => 'Les donnees de terrain et les observations citoyennes aident a identifier les zones ou la fragmentation menace les especes.',
                'type' => 'Decouverte scientifique',
                'region' => 'Afrique centrale',
                'source' => 'Convention on Biological Diversity',
                'source_url' => 'https://www.cbd.int/',
                'published_at' => now()->subDays(3),
                'priority' => 'medium',
                'tags' => ['biodiversite', 'forets', 'science'],
            ],
            [
                'title' => 'Pollution plastique: les gestes locaux comptent',
                'summary' => 'Collecte, tri, sensibilisation des commerces et reduction des emballages restent des leviers directs pour les communautes.',
                'type' => 'Article',
                'region' => 'International',
                'source' => 'UN Environment Programme',
                'source_url' => 'https://www.unep.org/',
                'published_at' => now()->subDays(5),
                'priority' => 'low',
                'tags' => ['dechets', 'pollution', 'action'],
            ],
            [
                'title' => 'Suivre les engagements climatiques internationaux',
                'summary' => 'Les accords climatiques definissent les efforts de reduction d emissions, l adaptation et les financements disponibles.',
                'type' => 'Article',
                'region' => 'International',
                'source' => 'UNFCCC',
                'source_url' => 'https://unfccc.int/',
                'published_at' => now()->subDays(8),
                'priority' => 'medium',
                'tags' => ['climat', 'onu', 'accords'],
            ],
            [
                'title' => 'Alerte feux de brousse en saison seche',
                'summary' => 'Les feux non controles menacent les sols, les cultures et les habitats. Les signalements rapides limitent les degats.',
                'type' => 'Alerte climatique',
                'region' => 'Nord Cameroun',
                'source' => 'FAO',
                'source_url' => 'https://www.fao.org/',
                'published_at' => now()->subDays(10),
                'priority' => 'high',
                'tags' => ['feux', 'sols', 'agriculture'],
            ],
            [
                'title' => 'Mangroves et protection du littoral',
                'summary' => 'Les mangroves reduisent l erosion, stockent du carbone et protegent les communautes cotieres.',
                'type' => 'Decouverte scientifique',
                'region' => 'Littoral',
                'source' => 'IUCN',
                'source_url' => 'https://www.iucn.org/',
                'published_at' => now()->subDays(12),
                'priority' => 'medium',
                'tags' => ['mangroves', 'carbone', 'littoral'],
            ],
            [
                'title' => 'Qualite de l air urbain: surveiller les zones de trafic',
                'summary' => 'Les villes peuvent reduire les expositions en cartographiant les zones polluees et en favorisant les mobilites propres.',
                'type' => 'Article',
                'region' => 'Douala / Yaounde',
                'source' => 'WHO',
                'source_url' => 'https://www.who.int/',
                'published_at' => now()->subDays(15),
                'priority' => 'medium',
                'tags' => ['air', 'sante', 'ville'],
            ],
            [
                'title' => 'Zones humides: reservoirs naturels contre les inondations',
                'summary' => 'La preservation des zones humides limite les crues, filtre l eau et soutient la biodiversite aquatique.',
                'type' => 'Article',
                'region' => 'Cameroun',
                'source' => 'Ramsar',
                'source_url' => 'https://www.ramsar.org/',
                'published_at' => now()->subDays(18),
                'priority' => 'medium',
                'tags' => ['eau', 'zones humides', 'inondations'],
            ],
            [
                'title' => 'Observation citoyenne des especes menacees',
                'summary' => 'Les donnees partagees par les citoyens completent les inventaires scientifiques et orientent les actions de conservation.',
                'type' => 'Decouverte scientifique',
                'region' => 'Afrique',
                'source' => 'GBIF',
                'source_url' => 'https://www.gbif.org/',
                'published_at' => now()->subDays(21),
                'priority' => 'low',
                'tags' => ['faune', 'citoyens', 'donnees'],
            ],
            [
                'title' => 'Tri et compostage dans les quartiers',
                'summary' => 'Le compostage reduit les dechets organiques et produit un amendement utile pour les jardins urbains.',
                'type' => 'Article',
                'region' => 'Cameroun',
                'source' => 'UN-Habitat',
                'source_url' => 'https://unhabitat.org/',
                'published_at' => now()->subDays(24),
                'priority' => 'low',
                'tags' => ['compost', 'dechets', 'quartier'],
            ],
        ];

        foreach ($newsItems as $item) {
            EnvironmentalNews::create([...$item, 'is_published' => true]);
        }

        $organizations = [
            ['name' => 'WWF', 'scope' => 'International', 'region' => 'Afrique centrale', 'focus' => 'Biodiversite, conservation des forets et especes menacees', 'project' => 'Appui aux aires protegees et aux programmes de conservation communautaire.', 'website_url' => 'https://www.wwf.org/', 'donate_url' => 'https://support.wwf.org.uk/donate', 'latitude' => 3.8667, 'longitude' => 11.5167, 'tags' => ['forets', 'faune', 'conservation']],
            ['name' => 'Greenpeace Africa', 'scope' => 'International', 'region' => 'Afrique', 'focus' => 'Justice climatique, deforestation, pollution et plaidoyer citoyen', 'project' => 'Campagnes de mobilisation et information publique sur les enjeux environnementaux.', 'website_url' => 'https://www.greenpeace.org/africa/', 'donate_url' => 'https://www.greenpeace.org/africa/en/donate/', 'latitude' => null, 'longitude' => null, 'tags' => ['climat', 'plaidoyer', 'campagnes']],
            ['name' => 'IUCN', 'scope' => 'International', 'region' => 'International', 'focus' => 'Conservation, politiques publiques, donnees scientifiques', 'project' => 'Expertise et ressources pour la protection de la nature et les politiques sectorielles.', 'website_url' => 'https://www.iucn.org/', 'donate_url' => 'https://www.iucn.org/donate', 'latitude' => null, 'longitude' => null, 'tags' => ['science', 'politique', 'conservation']],
            ['name' => 'African Wildlife Foundation', 'scope' => 'International', 'region' => 'Afrique', 'focus' => 'Protection de la faune, habitats et corridors ecologiques', 'project' => 'Programmes de conservation communautaire et lutte contre le braconnage.', 'website_url' => 'https://www.awf.org/', 'donate_url' => 'https://www.awf.org/donate', 'latitude' => null, 'longitude' => null, 'tags' => ['faune', 'habitats', 'braconnage']],
            ['name' => 'BirdLife International', 'scope' => 'International', 'region' => 'International', 'focus' => 'Protection des oiseaux, zones importantes pour la biodiversite', 'project' => 'Inventaires et conservation des sites critiques pour les especes migratrices.', 'website_url' => 'https://www.birdlife.org/', 'donate_url' => 'https://www.birdlife.org/donate/', 'latitude' => null, 'longitude' => null, 'tags' => ['oiseaux', 'biodiversite', 'sites']],
            ['name' => 'Eco Quartiers Cameroun', 'scope' => 'Local', 'region' => 'Douala / Yaounde', 'focus' => 'Nettoyage communautaire, tri, education environnementale', 'project' => 'Groupes de quartier pour organiser des collectes, signaler les depots sauvages et sensibiliser les familles.', 'website_url' => 'mailto:communities@ecoconnect.local?subject=Rejoindre%20Eco%20Quartiers%20Cameroun', 'donate_url' => 'mailto:don@ecoconnect.local?subject=Don%20Eco%20Quartiers%20Cameroun', 'latitude' => 4.0511, 'longitude' => 9.7679, 'tags' => ['communaute', 'dechets', 'education']],
            ['name' => 'Jeunes Forets du Dja', 'scope' => 'Local', 'region' => 'Sud / Est Cameroun', 'focus' => 'Reboisement, sensibilisation scolaire et suivi des coupes illegales', 'project' => 'Pepinieres communautaires et patrouilles citoyennes autour des zones forestieres.', 'website_url' => 'mailto:dja@ecoconnect.local?subject=Rejoindre%20Jeunes%20Forets%20du%20Dja', 'donate_url' => 'mailto:don@ecoconnect.local?subject=Don%20Jeunes%20Forets%20du%20Dja', 'latitude' => 3.1, 'longitude' => 12.8, 'tags' => ['reboisement', 'forets', 'ecoles']],
            ['name' => 'Rivieres Propres Wouri', 'scope' => 'Local', 'region' => 'Douala, Littoral', 'focus' => 'Surveillance des pollutions aquatiques et nettoyage des berges', 'project' => 'Collectes mensuelles, cartographie des rejets et ateliers dans les marches.', 'website_url' => 'mailto:wouri@ecoconnect.local?subject=Rejoindre%20Rivieres%20Propres%20Wouri', 'donate_url' => 'mailto:don@ecoconnect.local?subject=Don%20Rivieres%20Propres%20Wouri', 'latitude' => 4.05, 'longitude' => 9.7, 'tags' => ['eau', 'pollution', 'berges']],
            ['name' => 'Mont Cameroun EcoTrail', 'scope' => 'Local', 'region' => 'Sud-Ouest', 'focus' => 'Protection des sentiers, prevention des feux et tourisme durable', 'project' => 'Formation de guides, signalement des feux et reduction des dechets en montagne.', 'website_url' => 'mailto:mount@ecoconnect.local?subject=Rejoindre%20Mont%20Cameroun%20EcoTrail', 'donate_url' => 'mailto:don@ecoconnect.local?subject=Don%20Mont%20Cameroun%20EcoTrail', 'latitude' => 4.217, 'longitude' => 9.17, 'tags' => ['montagne', 'tourisme', 'feux']],
            ['name' => 'Sahel Vert Extreme-Nord', 'scope' => 'Local', 'region' => 'Extreme-Nord', 'focus' => 'Agroforesterie, lutte contre la desertification et gestion de l eau', 'project' => 'Plantations villageoises, foyers ameliores et sensibilisation sur les sols.', 'website_url' => 'mailto:sahel@ecoconnect.local?subject=Rejoindre%20Sahel%20Vert', 'donate_url' => 'mailto:don@ecoconnect.local?subject=Don%20Sahel%20Vert', 'latitude' => 10.5956, 'longitude' => 14.3247, 'tags' => ['sahel', 'eau', 'agroforesterie']],
        ];

        foreach ($organizations as $organization) {
            EnvironmentalOrganization::create([...$organization, 'is_active' => true]);
        }

        $legalGuides = [
            ['title' => 'Cadre national de gestion de l environnement', 'summary' => 'Comprendre les obligations de prevention, de signalement, de protection de l eau, des sols et des zones sensibles.', 'jurisdiction' => 'National', 'topic' => 'Droits et devoirs environnementaux', 'official_url' => 'https://minepded.gov.cm/', 'duties' => ['Ne pas polluer les eaux et sols', 'Signaler les incidents graves', 'Respecter les zones protegees'], 'tags' => ['cameroun', 'droits', 'signalement']],
            ['title' => 'Accord de Paris et engagements climatiques', 'summary' => 'Repere simple pour comprendre l attenuation, l adaptation, les contributions nationales et la solidarite climatique.', 'jurisdiction' => 'International', 'topic' => 'Accords climatiques', 'official_url' => 'https://unfccc.int/process-and-meetings/the-paris-agreement/the-paris-agreement', 'duties' => ['Reduire les emissions evitables', 'Soutenir les mesures d adaptation', 'Suivre les engagements publics'], 'tags' => ['onu', 'climat', 'accord']],
            ['title' => 'Convention sur la diversite biologique', 'summary' => 'Guide pour comprendre la conservation des especes, l usage durable des ressources et le partage des benefices.', 'jurisdiction' => 'International', 'topic' => 'Biodiversite', 'official_url' => 'https://www.cbd.int/', 'duties' => ['Eviter la destruction d habitats', 'Proteger les especes locales', 'Participer aux inventaires citoyens'], 'tags' => ['biodiversite', 'forets', 'especes']],
            ['title' => 'Convention Ramsar sur les zones humides', 'summary' => 'Reference pour proteger les zones humides, essentielles contre les inondations et pour la biodiversite aquatique.', 'jurisdiction' => 'International', 'topic' => 'Eau et zones humides', 'official_url' => 'https://www.ramsar.org/', 'duties' => ['Ne pas remblayer les zones humides', 'Preserver les berges', 'Signaler les pollutions aquatiques'], 'tags' => ['eau', 'zones humides', 'protection']],
            ['title' => 'Regles de signalement des pollutions', 'summary' => 'Ce guide explique comment documenter une pollution sans se mettre en danger et quelles informations transmettre.', 'jurisdiction' => 'National', 'topic' => 'Pollution', 'official_url' => 'https://minepded.gov.cm/', 'duties' => ['Noter le lieu exact', 'Eviter tout contact dangereux', 'Ajouter photo et description si possible'], 'tags' => ['pollution', 'preuve', 'signalement']],
            ['title' => 'CITES et commerce des especes menacees', 'summary' => 'Comprendre les restrictions sur le commerce des animaux, plantes et produits issus d especes menacees.', 'jurisdiction' => 'International', 'topic' => 'Faune sauvage', 'official_url' => 'https://cites.org/', 'duties' => ['Ne pas acheter d especes protegees', 'Signaler le trafic suspect', 'Verifier les autorisations'], 'tags' => ['faune', 'trafic', 'cites']],
            ['title' => 'Responsabilite environnementale des entreprises', 'summary' => 'Principes pratiques pour comprendre les obligations de prevention, controle des impacts et reparation.', 'jurisdiction' => 'National', 'topic' => 'Activites economiques', 'official_url' => 'https://minepded.gov.cm/', 'duties' => ['Evaluer les impacts', 'Limiter les rejets', 'Informer les populations exposees'], 'tags' => ['entreprises', 'impacts', 'reparation']],
            ['title' => 'Gestion communautaire des forets', 'summary' => 'Synthese des droits et devoirs des communautes impliquees dans la surveillance et l usage durable des forets.', 'jurisdiction' => 'National', 'topic' => 'Forets', 'official_url' => 'https://www.minfof.cm/', 'duties' => ['Respecter les plans simples de gestion', 'Eviter les coupes illegales', 'Documenter les infractions'], 'tags' => ['forets', 'communautes', 'gestion']],
            ['title' => 'Dechets dangereux et protection sanitaire', 'summary' => 'Identifier les risques lies aux huiles, piles, produits chimiques et dechets medicaux afin d eviter les expositions.', 'jurisdiction' => 'Sectoriel', 'topic' => 'Dechets dangereux', 'official_url' => 'https://www.unep.org/explore-topics/chemicals-waste', 'duties' => ['Separer les dechets dangereux', 'Ne pas bruler les produits toxiques', 'Alerter les services competents'], 'tags' => ['dechets', 'sante', 'toxique']],
            ['title' => 'Acces a l information environnementale', 'summary' => 'Repere pour demander, partager et utiliser des informations environnementales d interet public.', 'jurisdiction' => 'International', 'topic' => 'Information publique', 'official_url' => 'https://www.unep.org/', 'duties' => ['Demander les informations utiles', 'Partager les donnees fiables', 'Eviter les fausses alertes'], 'tags' => ['information', 'transparence', 'citoyen']],
        ];

        foreach ($legalGuides as $guide) {
            EnvironmentalLegalGuide::create([...$guide, 'is_published' => true]);
        }

        UserSavedHubItem::create([
            'user_id' => $emma->id,
            'item_type' => 'news',
            'item_id' => EnvironmentalNews::where('priority', 'high')->first()->id,
        ]);
        UserSavedHubItem::create([
            'user_id' => $emma->id,
            'item_type' => 'organization',
            'item_id' => EnvironmentalOrganization::where('scope', 'Local')->first()->id,
        ]);
        UserSavedHubItem::create([
            'user_id' => $emma->id,
            'item_type' => 'legal_guide',
            'item_id' => EnvironmentalLegalGuide::where('jurisdiction', 'National')->first()->id,
        ]);
    }
}

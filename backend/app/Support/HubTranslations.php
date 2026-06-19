<?php

namespace App\Support;

/**
 * Canonical English translations for the seeded Environment Hub content.
 *
 * Keyed by the original (French) `title` for news/legal guides and by `name`
 * for organizations. Used both by the database seeder (fresh installs) and by
 * the data migration that backfills existing rows. The French values stored in
 * the base columns remain the default locale.
 */
class HubTranslations
{
    /** @return array<string, array<string, mixed>> */
    public static function news(): array
    {
        return [
            'Veille pluies intenses et risques d inondation' => [
                'title' => 'Heavy rainfall watch and flood risk',
                'summary' => 'Monitor official bulletins, avoid low-lying areas and quickly report blocked drains or weakened riverbanks.',
                'type' => 'Climate alert',
                'region' => 'Cameroon',
            ],
            'Biodiversite forestiere: surveiller les corridors ecologiques' => [
                'title' => 'Forest biodiversity: monitoring ecological corridors',
                'summary' => 'Field data and citizen observations help identify areas where fragmentation threatens species.',
                'type' => 'Scientific discovery',
                'region' => 'Central Africa',
            ],
            'Pollution plastique: les gestes locaux comptent' => [
                'title' => 'Plastic pollution: local actions matter',
                'summary' => 'Collection, sorting, raising awareness among shops and reducing packaging remain direct levers for communities.',
                'type' => 'Article',
                'region' => 'International',
            ],
            'Suivre les engagements climatiques internationaux' => [
                'title' => 'Tracking international climate commitments',
                'summary' => 'Climate agreements define emission reduction efforts, adaptation and the funding available.',
                'type' => 'Article',
                'region' => 'International',
            ],
            'Alerte feux de brousse en saison seche' => [
                'title' => 'Bushfire alert during the dry season',
                'summary' => 'Uncontrolled fires threaten soils, crops and habitats. Quick reporting limits the damage.',
                'type' => 'Climate alert',
                'region' => 'Northern Cameroon',
            ],
            'Mangroves et protection du littoral' => [
                'title' => 'Mangroves and coastal protection',
                'summary' => 'Mangroves reduce erosion, store carbon and protect coastal communities.',
                'type' => 'Scientific discovery',
                'region' => 'Littoral',
            ],
            'Qualite de l air urbain: surveiller les zones de trafic' => [
                'title' => 'Urban air quality: monitoring traffic areas',
                'summary' => 'Cities can reduce exposure by mapping polluted areas and promoting clean mobility.',
                'type' => 'Article',
                'region' => 'Douala / Yaounde',
            ],
            'Zones humides: reservoirs naturels contre les inondations' => [
                'title' => 'Wetlands: natural reservoirs against flooding',
                'summary' => 'Preserving wetlands limits flooding, filters water and supports aquatic biodiversity.',
                'type' => 'Article',
                'region' => 'Cameroon',
            ],
            'Observation citoyenne des especes menacees' => [
                'title' => 'Citizen monitoring of endangered species',
                'summary' => 'Data shared by citizens complements scientific inventories and guides conservation actions.',
                'type' => 'Scientific discovery',
                'region' => 'Africa',
            ],
            'Tri et compostage dans les quartiers' => [
                'title' => 'Sorting and composting in neighbourhoods',
                'summary' => 'Composting reduces organic waste and produces a useful amendment for urban gardens.',
                'type' => 'Article',
                'region' => 'Cameroon',
            ],
        ];
    }

    /** @return array<string, array<string, mixed>> */
    public static function organizations(): array
    {
        return [
            'WWF' => [
                'scope' => 'International',
                'region' => 'Central Africa',
                'focus' => 'Biodiversity, conservation of forests and endangered species',
                'project' => 'Support for protected areas and community conservation programmes.',
            ],
            'Greenpeace Africa' => [
                'scope' => 'International',
                'region' => 'Africa',
                'focus' => 'Climate justice, deforestation, pollution and citizen advocacy',
                'project' => 'Mobilization campaigns and public information on environmental issues.',
            ],
            'IUCN' => [
                'scope' => 'International',
                'region' => 'International',
                'focus' => 'Conservation, public policy, scientific data',
                'project' => 'Expertise and resources for nature protection and sectoral policies.',
            ],
            'African Wildlife Foundation' => [
                'scope' => 'International',
                'region' => 'Africa',
                'focus' => 'Protection of wildlife, habitats and ecological corridors',
                'project' => 'Community conservation programmes and anti-poaching efforts.',
            ],
            'BirdLife International' => [
                'scope' => 'International',
                'region' => 'International',
                'focus' => 'Protection of birds and key biodiversity areas',
                'project' => 'Inventories and conservation of critical sites for migratory species.',
            ],
            'Eco Quartiers Cameroun' => [
                'scope' => 'Local',
                'region' => 'Douala / Yaounde',
                'focus' => 'Community clean-ups, waste sorting, environmental education',
                'project' => 'Neighbourhood groups to organize collections, report illegal dumping and raise family awareness.',
            ],
            'Jeunes Forets du Dja' => [
                'scope' => 'Local',
                'region' => 'South / East Cameroon',
                'focus' => 'Reforestation, school awareness and monitoring of illegal logging',
                'project' => 'Community nurseries and citizen patrols around forest areas.',
            ],
            'Rivieres Propres Wouri' => [
                'scope' => 'Local',
                'region' => 'Douala, Littoral',
                'focus' => 'Monitoring of water pollution and cleaning of riverbanks',
                'project' => 'Monthly clean-ups, mapping of discharges and workshops in markets.',
            ],
            'Mont Cameroun EcoTrail' => [
                'scope' => 'Local',
                'region' => 'South-West',
                'focus' => 'Trail protection, fire prevention and sustainable tourism',
                'project' => 'Training guides, reporting fires and reducing waste in the mountains.',
            ],
            'Sahel Vert Extreme-Nord' => [
                'scope' => 'Local',
                'region' => 'Far North',
                'focus' => 'Agroforestry, fighting desertification and water management',
                'project' => 'Village plantations, improved cookstoves and awareness about soils.',
            ],
        ];
    }

    /** @return array<string, array<string, mixed>> */
    public static function legalGuides(): array
    {
        return [
            'Cadre national de gestion de l environnement' => [
                'title' => 'National environmental management framework',
                'summary' => 'Understand the duties of prevention, reporting, and protection of water, soils and sensitive areas.',
                'topic' => 'Environmental rights and duties',
                'jurisdiction' => 'National',
                'duties' => ['Do not pollute water and soils', 'Report serious incidents', 'Respect protected areas'],
            ],
            'Accord de Paris et engagements climatiques' => [
                'title' => 'Paris Agreement and climate commitments',
                'summary' => 'A simple reference to understand mitigation, adaptation, national contributions and climate solidarity.',
                'topic' => 'Climate agreements',
                'jurisdiction' => 'International',
                'duties' => ['Reduce avoidable emissions', 'Support adaptation measures', 'Track public commitments'],
            ],
            'Convention sur la diversite biologique' => [
                'title' => 'Convention on Biological Diversity',
                'summary' => 'A guide to understand species conservation, sustainable use of resources and benefit sharing.',
                'topic' => 'Biodiversity',
                'jurisdiction' => 'International',
                'duties' => ['Avoid habitat destruction', 'Protect local species', 'Take part in citizen inventories'],
            ],
            'Convention Ramsar sur les zones humides' => [
                'title' => 'Ramsar Convention on Wetlands',
                'summary' => 'A reference for protecting wetlands, essential against flooding and for aquatic biodiversity.',
                'topic' => 'Water and wetlands',
                'jurisdiction' => 'International',
                'duties' => ['Do not fill in wetlands', 'Preserve riverbanks', 'Report water pollution'],
            ],
            'Regles de signalement des pollutions' => [
                'title' => 'Rules for reporting pollution',
                'summary' => 'This guide explains how to document pollution without putting yourself at risk and what information to provide.',
                'topic' => 'Pollution',
                'jurisdiction' => 'National',
                'duties' => ['Note the exact location', 'Avoid any dangerous contact', 'Add a photo and description if possible'],
            ],
            'CITES et commerce des especes menacees' => [
                'title' => 'CITES and trade in endangered species',
                'summary' => 'Understand the restrictions on trade in animals, plants and products from endangered species.',
                'topic' => 'Wildlife',
                'jurisdiction' => 'International',
                'duties' => ['Do not buy protected species', 'Report suspicious trafficking', 'Check permits'],
            ],
            'Responsabilite environnementale des entreprises' => [
                'title' => 'Corporate environmental responsibility',
                'summary' => 'Practical principles to understand the duties of prevention, impact control and remediation.',
                'topic' => 'Economic activities',
                'jurisdiction' => 'National',
                'duties' => ['Assess impacts', 'Limit discharges', 'Inform exposed populations'],
            ],
            'Gestion communautaire des forets' => [
                'title' => 'Community forest management',
                'summary' => 'A summary of the rights and duties of communities involved in monitoring and sustainable use of forests.',
                'topic' => 'Forests',
                'jurisdiction' => 'National',
                'duties' => ['Respect simple management plans', 'Avoid illegal logging', 'Document violations'],
            ],
            'Dechets dangereux et protection sanitaire' => [
                'title' => 'Hazardous waste and health protection',
                'summary' => 'Identify the risks linked to oils, batteries, chemicals and medical waste to avoid exposure.',
                'topic' => 'Hazardous waste',
                'jurisdiction' => 'Sectoral',
                'duties' => ['Separate hazardous waste', 'Do not burn toxic products', 'Alert the relevant services'],
            ],
            'Acces a l information environnementale' => [
                'title' => 'Access to environmental information',
                'summary' => 'A reference for requesting, sharing and using environmental information of public interest.',
                'topic' => 'Public information',
                'jurisdiction' => 'International',
                'duties' => ['Request useful information', 'Share reliable data', 'Avoid false alarms'],
            ],
        ];
    }
}

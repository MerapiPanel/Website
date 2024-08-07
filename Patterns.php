<?php

namespace MerapiPanel\Module\Website {

    use MerapiPanel\Box\Module\__Fragment;
    use MerapiPanel\Box\Module\Entity\Module;
    use MerapiPanel\Database\DB;
    use PDO;

    class Patterns extends __Fragment
    {
        protected $module;
        function onCreate(Module $module)
        {
            $this->module = $module;
        }

        function listpops()
        {
            $data = [];

            // Load JSON files from the specified directory
            foreach (glob(__DIR__ . "/data/patterns/*.json") as $file) {
                $name = basename($file, ".json");
                $content = json_decode(file_get_contents($file) ?? "{}", true);

                // Ensure $content is an array for merging purposes
                $content = is_array($content) ? $content : [$content];

                // Add the JSON file data to the $data array
                $data[] = [
                    "name" => $name,
                    ...$content,
                    "removeable" => false
                ];
            }

            // Fetch patterns from the database
            $SQL = "SELECT * FROM patterns";
            $stmt = DB::instance()->query($SQL);
            $dbPatterns = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Merge database patterns with the existing $data
            foreach ($dbPatterns as $pattern) {
                $findKey = array_search($pattern['name'], array_column($data, "name"));
                if ($findKey !== false) {
                    // Merge existing data with database data
                    $data[$findKey] = [
                        ...$data[$findKey],
                        ...$pattern
                    ];
                } else {
                    // Add new database pattern to the $data array
                    $data[] = $pattern;
                }
            }

            return $data;
        }



        function addpop($name, $label, $media, $components = [])
        {

            if (empty($components)) $components = "[]";
            $components = !is_string($components) ? json_encode($components) : $components;
            $SQL = "REPLACE INTO patterns (name, media, label, components) VALUES (:name, :media, :label, :components)";
            $stmt = DB::instance()->prepare($SQL);
            $stmt->execute([
                "name"  => $name,
                "media" => $media,
                "label" => $label,
                "components" => $components
            ]);

            return [
                "name"  => $name,
                "media" => $media,
                "label" => $label,
                "components" => json_decode($components, 1)
            ];
        }
    }
}

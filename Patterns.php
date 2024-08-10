<?php

namespace MerapiPanel\Module\Website {

    use Exception;
    use MerapiPanel\Box;
    use MerapiPanel\Box\Module\__Fragment;
    use MerapiPanel\Box\Module\Entity\Module;
    use MerapiPanel\Database\DB;
    use MerapiPanel\Views\View;
    use PDO;
    use Symfony\Component\Filesystem\Path;

    class Patterns extends __Fragment
    {
        protected $module;
        function onCreate(Module $module)
        {
            $this->module = $module;
        }


        private function getProvidePatterns()
        {
            $result = [];
            foreach ($this->module->getLoader()->getListModule() as $module => $moduledir) {
                foreach (glob(Path::join($moduledir, "data", "patterns", "*.json")) as $file) {
                    $raw = file_get_contents($file);
                    $pattern = json_decode($raw, 1);
                    if (!is_array($pattern)) continue;
                    $name = $module . "/" . basename($file, ".json");
                    if (!isset($pattern['components'])) continue;
                    $result[] = [
                        "label" => "Unamed",
                        "media" => "Pattern",
                        ...$pattern,
                        "name"  => $name,
                        "removable" => false
                    ];
                }
            }
            return $result;
        }

        function listpops()
        {

            $data = $this->getProvidePatterns();

            // Fetch patterns from the database
            $SQL = "SELECT * FROM patterns";
            $stmt = DB::instance()->query($SQL);
            $dbPatterns = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Merge database patterns with the existing $data
            foreach ($dbPatterns as $pattern) {
                $pattern['components'] = !is_array($pattern['components']) ? json_decode($pattern['components'], true) : [];
                $findKey = array_search($pattern['name'], array_column($data, "name"));
                if ($findKey !== false) {
                    // Merge existing data with database data
                    $data[$findKey] = [
                        ...$data[$findKey],
                        ...$pattern
                    ];
                } else {
                    // Add new database pattern to the $data array
                    $data[] = [
                        ...$pattern,
                        "removable" => true
                    ];
                }
            }

            $data = array_map(function ($pattern) {
                if (isset($pattern['media'])) return $pattern;
                $pattern['html'] = View::minimizeHTML(Box::module("Editor")->Blocks->render($pattern['components']));
                return $pattern;
            }, $data);

            return $data;
        }


        function getpop($name)
        {
            $SQL = "SELECT * FROM patterns WHERE name =?";
            $stmt = DB::instance()->prepare($SQL);
            $stmt->execute([$name]);
            if ($pattern = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $pattern['components'] = json_decode($pattern['components'] ?? '[]', 1);
                return $pattern;
            }
            [$moduleName, $patternName] = explode("/", $name);
            $module = Box::module($moduleName)->data->patterns->get("$patternName.json");
            return $module->getContent();
        }


        function removepop($name)
        {
            if (empty($name)) throw new Exception("Could't delete pattern without name", 401);
            $SQL = "DELETE FROM patterns WHERE name =?";
            $stmt = DB::instance()->prepare($SQL);
            return $stmt->execute([$name]);
        }



        function addpop($name, $label, $components = [])
        {

            if (empty($components)) $components = "[]";
            $components = !is_string($components) ? json_encode($components) : $components;
            $SQL = "REPLACE INTO patterns (name, label, components) VALUES (:name, :label, :components)";
            $stmt = DB::instance()->prepare($SQL);
            $stmt->execute([
                "name"  => $name,
                "label" => $label,
                "components" => $components
            ]);

            return [
                "name"  => $name,
                "media" => null,
                "label" => $label,
                "components" => json_decode($components, 1)
            ];
        }
    }
}

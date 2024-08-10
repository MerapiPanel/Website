<?php

namespace MerapiPanel\Module\Website;

use Exception;
use MerapiPanel\Box;
use MerapiPanel\Box\Module\__Fragment;
use MerapiPanel\Box\Module\Entity\Module;
use MerapiPanel\Database\DB;
use MerapiPanel\Utility\Http\Request;
use MerapiPanel\Utility\Util;
use MerapiPanel\Views\View;
use PDO;
use Symfony\Component\Filesystem\Path;
use Throwable;

class Pages extends __Fragment
{

    protected $module;
    function onCreate(Module $module)
    {
        $this->module = $module;
    }


    /**
     * Summary of render
     * help other module to use api listen on page render
     * @param mixed $htmlstring
     * @param mixed $page
     * @return mixed
     */
    public function render($htmlstring, $page)
    {
        return $htmlstring;
    }


    /**
     * Summary of shortcode
     * api used for other module to render their short codes
     * @param mixed $code
     * @param mixed $result
     * @return mixed
     */
    public function shortcode($code)
    {
        $result = false;
        $view = View::getInstance();
        try {

            $module  = preg_replace('/\..*$/m', '', $code);
            $path    = Path::join("shortcode", preg_replace('/^\w+\./m', '', $code));
            $wrapper = $view->load("@$module/$path.twig");

            try {

                // Check if the template extends another template
                $templateSource = $view->getLoader()->getSourceContext("@$module/$path.twig")->getCode();
                $extends = preg_match('/\{\%\s*extends\s+[\'"]([^\'"]+)[\'"]\s*\%\}/', $templateSource, $matches);
                if ($extends) throw new Exception("shortcode not allowed extend other template");
                return $wrapper->render();
            } catch (Throwable $t) {
                if ($wrapper->hasBlock("error")) {
                    return $wrapper->renderBlock("error", ["error" => [
                        "message" => $t->getMessage(),
                        "line"    => $t->getLine(),
                        "file"    => $t->getFile()
                    ]]);
                } else {

                    return <<<HTML
                    <div class="bg-danger bg-opacity-10 p-3 rounded-2">
                        <div class="fs-4 fw-semibold">Caught an Error</div>
                        <p>{$t->getMessage()}</p>
                    </div>
                    HTML;
                }
            }
        } catch (Throwable $t) {
            // silent
            error_log($t->getMessage());
        }

        return $result;
    }



    function renderProperties($properties)
    {

        $output = [];
        foreach ($properties as $property) {

            $value = $property['value'] ?? $property["default"] ?? "";

            if ($property['name'] == "meta-title") {
                $output[] = "<title>{$value}</title><meta name=\"title\" content=\"{$value}\" /><meta property=\"og:title\" content=\"{$value}\" />";
            } else if ($property['name'] == "meta-description") {
                $output[] = "<meta name=\"description\" content=\"{$value}\" /><meta property=\"og:description\" content=\"{$value}\" />";
            } else if ($property['name'] == "meta-image") {
                $image = Util::siteURL($value ?? "");
                $output[] = "<meta property=\"og:image\" content=\"{$image}\" />";
            } else if ($property['name'] == "with-twitter-card") {
                $output[] = $this->generateTwitterCard($property, $properties);
            } else {
                $output[] = $property;
            }
        }

        return $output;
    }

    private function generateTwitterCard($property, $properties)
    {

        $ptitle = array_values(array_filter($properties, fn($prop) => $prop['name'] == "meta-title"))[0] ?? false;
        $pdesct = array_values(array_filter($properties, fn($prop) => $prop['name'] == "meta-description"))[0] ?? false;
        $pimage = array_values(array_filter($properties, fn($prop) => $prop['name'] == "meta-image"))[0] ?? false;

        $title = $ptitle['value'] ?? $ptitle['default'] ?? "";
        $desct = $pdesct['value'] ?? $pdesct['default'] ?? "";
        $image = Util::siteURL($pimage['value'] ?? $pimage['default'] ?? "");
        $site_url = Request::getInstance()->getURI();

        return View::minimizeHTML(<<<HTML
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="{$site_url}" />
        <meta property="twitter:title" content="{$title}" />
        <meta property="twitter:description" content="{$desct}" />
        <meta property="twitter:image" content="{$image}" />
        HTML);
    }


    private array $cached_defined_properties = [];
    private function getDefinePageProperties()
    {

        if (!empty($this->cached_defined_properties)) return $this->cached_defined_properties;
        $properties = $this->module->data->get("page-properties.json")->getContent();
        if (is_array($properties)) {

            // Filter duplicates based on 'name'
            $finalProperties = [];
            $names = [];
            foreach ($properties as $property) {
                if (isset($property['name']) && !in_array($property['name'], $names)) {
                    $names[] = $property['name'];
                    $finalProperties[] = $property;
                }
            }
            $this->cached_defined_properties = $finalProperties;
        }
        return $this->cached_defined_properties;
    }


    private function filterProperty($properties = [])
    {
        return array_values(array_filter(array_map(function ($prop) {

            if (!isset($prop['name'], $prop['value'], $prop['type']) || empty($prop['name']) || empty($prop['value']) || empty($prop['type'])) return;

            $newprop = [
                "name" => $prop['name'],
                "value" => $prop['value'],
                "type" => $prop['type']
            ];

            if (isset($prop['selected-type'])) {
                $newprop['selectedType'] = $prop['selected-type'];
            } else if (isset($prop['selectedType'])) {
                $newprop['selected-type'] = $prop['selectedType'];
            }

            return $newprop;
        }, $properties)));
    }


    public function sync_properties($properties): array
    {
        // Decode JSON if needed and ensure it's an array
        $properties = !is_array($properties) ? json_decode($properties, true) : $properties;

        // If properties are empty, return default page properties
        if (empty($properties)) return $this->getDefinePageProperties();

        // Get defined page properties
        $definedProperties = $this->getDefinePageProperties();
        $mergedProperties = [];

        // Create a map for quick lookup of properties by name
        $propertiesMap = [];
        foreach ($properties as $property) {
            if (isset($property['name'])) {
                $propertiesMap[$property['name']] = $property;
            }
        }

        // Merge properties with defined properties
        foreach ($definedProperties as $prop) {
            if (!isset($prop['name'])) continue;

            if (isset($propertiesMap[$prop['name']])) {
                // Merge properties, prioritizing defined properties and default type
                $mergedProperties[] = array_merge(
                    $propertiesMap[$prop['name']],
                    $prop,
                    ['type' => $prop['type'] ?? 'text']
                );
            } else {
                // Add defined property if not found in properties
                $mergedProperties[] = $prop;
            }
        }

        // Add any remaining properties that were not defined
        foreach ($properties as $property) {
            if (isset($property['name']) && !isset($propertiesMap[$property['name']])) {
                $mergedProperties[] = $property;
            }
        }

        // Filter duplicates based on 'name'
        $finalProperties = [];
        $names = [];
        foreach ($mergedProperties as $property) {
            if (isset($property['name']) && !in_array($property['name'], $names)) {
                $names[] = $property['name'];
                $finalProperties[] = $property;
            }
        }

        return $finalProperties;
    }



    private $loged_pages = [];
    function listpops(): array
    {
        if (!empty($this->loged_pages)) return $this->loged_pages;

        $fixed_data = [];
        foreach (array_values($this->module->getLoader()->getListModule()) as $modpath) {
            $moduleName = basename($modpath);
            foreach (glob(Path::join($modpath, "data", "pages", "*.json")) as $file) {
                $data = json_decode(file_get_contents($file), true);
                if (!isset($data['route'], $data['components'])) {
                    continue;
                }
                foreach ($data as $key => $value) {
                    if (is_string($value) && strpos($value, 'file:.') === 0) {
                        $data[$key] = file_get_contents(Path::join($modpath, "data", "pages", substr($value, 5)));
                    }
                }
                if (!isset($data['title'])) {
                    $data['title'] = basename($file, ".json");
                }
                $data['name']      = $moduleName . "/" . basename($file, ".json");
                $data['removable'] = false;
                $fixed_data[] = $data;
            }
        }

        $SQL = "SELECT * FROM pages ORDER BY `post_date` DESC";
        $pages = DB::instance()->query($SQL)->fetchAll(PDO::FETCH_ASSOC);

        foreach ($fixed_data as $page) {

            $find = array_search($page['name'], array_column($pages, 'name'));
            if ($find !== false) {
                $page = array_merge($page, $pages[$find]);
                $pages[$find] = $page;
            } else {

                $pages[] = $page;
            }
        }

        $pages = array_map(function ($page) {

            if (preg_match('/^[A-Z](\w+)\/.*/', $page['name'])) {
                $moduleName = preg_replace('/\/.*$/', '', $page['name']);
                if (!in_array($moduleName, array_keys($this->module->getLoader()->getListModule()))) return;
            }

            if (isset($page['components']) && is_string($page['components'])) $page['components'] = json_decode($page['components'], true);
            if (isset($page['variables']) && is_string($page['variables'])) $page['variables'] = json_decode($page['variables'], true);
            if (!isset($page['removable'])) $page['removable'] = true;
            $page['properties'] = $this->sync_properties($page["properties"] ?? []);
            return $page;
        }, $pages);

        $this->loged_pages = array_values(array_filter($pages));
        return $this->loged_pages;
    }


    function getpop($name = null, $id = null)
    {
        $page = [];
        if (empty($name) && empty($id)) {
            return [];
        } else if ($id) {

            $SQL = "SELECT * FROM pages WHERE id = ?";
            $stmt = DB::instance()->prepare($SQL);
            $stmt->execute([$id]);
            $page = $stmt->fetch(PDO::FETCH_ASSOC);
            if (isset($page['components'])) {
                $page['components'] = json_decode($page['components'], true);
            }
            $page['properties'] = $this->sync_properties($page["properties"]);
        } else {

            $SQL = "SELECT * FROM pages WHERE name = ?";
            $stmt = DB::instance()->prepare($SQL);
            $stmt->execute([$name]);
            $page = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($page) {
                if (isset($page['components'])) {
                    $page['components'] = json_decode($page['components'], true);
                }
                $page['properties'] = $this->sync_properties($page["properties"]);
            }
            $listpops = $this->listpops();
            $filter   = array_filter($listpops, fn($p) => $p['name'] == $name);
            if (empty($filter)) {
                throw new Exception("Page {$name} not found", 404);
            }
            $page = array_values($filter)[0];
        }
        if (preg_match('/^[A-Z](\w+)\/.*/', $page['name'])) {
            $moduleName = preg_replace('/\/.*$/', '', $page['name']);
            if (!in_array($moduleName, array_keys($this->module->getLoader()->getListModule()))) return [];
        }
        return $page;
    }

    /**
     * Summary of fetchAll
     * @deprecated fetchAll will remove soon use listpops insthead
     * @return array
     */
    function fetchAll()
    {
        return $this->listpops();
    }



    function fetchOne($id)
    {
        $SQL = "SELECT * FROM pages WHERE id = ?";
        $stmt = DB::instance()->prepare($SQL);
        $stmt->execute([$id]);
        $template = $stmt->fetch(PDO::FETCH_ASSOC);
        if (isset($template['components'])) {
            $template['components'] = json_decode($template['components'], true);
        }
        return $template;
    }



    function add($name, $title, $description, $route, $components = [], $styles = "", $properties = [])
    {
        if (!$this->module->getRoles()->isAllowed(0)) {
            throw new Exception("Access denied");
        }

        $components_array = !is_array($components) ? json_decode($components, 1) : $components;
        $properties_array = !is_array($properties) ?  json_decode($properties, 1) : $properties;
        $components_string = is_string($components) ? $components : json_encode($components);
        $properties_string = json_encode($this->filterProperty($properties_array));


        $SQL = <<<SQL
        INSERT INTO pages 
            (`name`, `title`, `description`, `route`, `components`, `styles`, `properties`) 
        VALUES 
            (:name, :title, :description, :route, :components, :styles, :properties)
        ON DUPLICATE KEY UPDATE 
            `name`=:name, 
            `title`=:title, 
            `description`=:description, 
            `route`=:route, 
            `components`=:components, 
            `styles`=:styles, 
            `properties`=:properties
        SQL;

        $stmt = DB::instance()->prepare($SQL);
        if ($stmt->execute([
            "name" => $name,
            "title" => $title,
            "description" => $description,
            "route" => $route,
            "components" => $components_string,
            "styles" => $styles,
            "properties" => $properties_string
        ])) {

            return [
                "id"    => DB::instance()->lastInsertId(),
                "title" => $title,
                "name"  => $name,
                "description" => $description,
                "route"      => $route,
                "components" => $components_array,
                "properties" => $properties_array,
                "styles"     => $styles
            ];
        }
        throw new Exception("Failed to insert page");
    }


    function save($id, $name, $title, $route, $description, $components = [], $styles = "", $properties = [])
    {

        if (!$this->module->getRoles()->isAllowed(0)) {
            throw new Exception("Access denied");
        }
        if (empty($id)) {
            return $this->add($name, $title, $description, $route, $components, $styles, $properties);
        }

        $components_array  = !is_array($components) ? json_decode($components, 1) : $components;
        $properties_array  = !is_array($properties) ?  json_decode($properties, 1) : $properties;
        $components_string = is_string($components) ? $components : json_encode($components);
        $properties_string = json_encode($this->filterProperty($properties_array));


        $SQL = "REPLACE INTO pages (`id`, `name`, `title`, `description`, `route`, `components`, `styles`, `properties`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = DB::instance()->prepare($SQL);
        if ($stmt->execute([
            $id,
            $name,
            $title,
            $description,
            $route,
            $components_string,
            $styles,
            $properties_string
        ])) {

            return [
                "id"     => $id,
                "name"   => $name,
                "title"  => $title,
                "description" => $description,
                "route"      => $route,
                "components" => $components_array,
                "properties" => $properties_array,
                "styles"     => $styles
            ];
        }
        throw new Exception("Failed to update page");
    }


    function delete($id)
    {
        if (!$this->module->getRoles()->isAllowed(0)) {
            throw new \Exception("Access denied");
        }
        $SQL = "DELETE FROM pages WHERE id = ?";
        $stmt = DB::instance()->prepare($SQL);
        if ($stmt->execute([$id])) {
            return true;
        }
        throw new \Exception("Failed to delete page");
    }
}

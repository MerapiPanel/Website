<?php

namespace MerapiPanel\Module\Website;

use Exception;
use MerapiPanel\Box;
use MerapiPanel\Box\Module\__Fragment;
use MerapiPanel\Database\DB;
use PDO;
use Symfony\Component\Filesystem\Path;
use Throwable;

class Pages extends __Fragment
{

    protected $module;
    function onCreate(\MerapiPanel\Box\Module\Entity\Module $module)
    {
        $this->module = $module;
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
        foreach ($pages as &$page) {
            if (isset($page['components']) && is_string($page['components'])) {
                $page['components'] = json_decode($page['components'], true);
            }
            if (isset($page['variables']) && is_string($page['variables'])) {
                $page['variables'] = json_decode($page['variables'], true);
            }
            if (!isset($page['removable'])) {
                $page['removable'] = true;
            }

            if (isset($page['properties']) && is_string($page['properties'])) {
                $page['properties'] = json_decode($page['properties'], true);
            }
            foreach ($this->module->data->get("page-properties.json")->getContent() as $prop) {
                if (!isset($prop['name'])) continue;
                if (!in_array($prop['name'], array_column($page['properties'] ?? [], "name"))) {
                    if (!isset($page['properties'])) $page['properties'] = [];
                    $page['properties'][] = $prop;
                }
            }
        }

        $this->loged_pages = $pages;
        return $this->loged_pages;
    }


    function getpop($name = null, $id = null)
    {
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
            if (isset($page['properties']) && is_string($page['properties'])) {
                $page['properties'] = json_decode($page['properties'], true);
            }
            foreach ($this->module->data->get("page-properties.json")->getContent() as $prop) {
                if (!isset($prop['name'])) continue;
                if (!in_array($prop['name'], array_column($page['properties'] ?? [], "name"))) {
                    if (!isset($page['properties'])) $page['properties'] = [];
                    $page['properties'][] = $prop;
                }
            }
            return $page;
        } else {

            $SQL = "SELECT * FROM pages WHERE name = ?";
            $stmt = DB::instance()->prepare($SQL);
            $stmt->execute([$name]);
            $page = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($page) {
                if (isset($page['components'])) {
                    $page['components'] = json_decode($page['components'], true);
                }
                if (isset($page['properties']) && is_string($page['properties'])) {
                    $page['properties'] = json_decode($page['properties'], true);
                }
                if (isset($page['properties']) && is_string($page['properties'])) {
                    $page['properties'] = json_decode($page['properties'], true);
                }
                foreach ($this->module->data->get("page-properties.json")->getContent() as $prop) {
                    if (!isset($prop['name'])) continue;
                    if (!in_array($prop['name'], array_column($page['properties'] ?? [], "name"))) {
                        if (!isset($page['properties'])) $page['properties'] = [];
                        $page['properties'][] = $prop;
                    }
                }
                return $page;
            }
            $listpops = $this->listpops();
            $filter   = array_filter($listpops, fn ($p) => $p['name'] == $name);
            if (empty($filter)) throw new Exception("Page {$name} not found", 404);
            return array_values($filter)[0];
        }
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

        $SQL = "INSERT INTO pages (name, title, description, route, components, styles, properties) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = DB::instance()->prepare($SQL);
        if ($stmt->execute([
            $name,
            $title,
            $description,
            $route,
            (is_string($components) ? $components : json_encode($components)),
            $styles,
            (is_string($properties) ? $properties : json_encode($properties))
        ])) {

            return [
                "id"    => DB::instance()->lastInsertId(),
                "title" => $title,
                "name"  => $name,
                "description" => $description,
                "route"      => $route,
                "components" => $components,
                "properties" => $properties,
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

        $SQL = "REPLACE INTO pages (id, name, title, description, route, components, styles, properties) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = DB::instance()->prepare($SQL);
        if ($stmt->execute([
            $id,
            $name,
            $title,
            $description,
            $route,
            (is_string($components) ? $components : json_encode($components)),
            $styles,
            (is_string($properties) ? $properties : json_encode($properties))
        ])) {

            return [
                "id"     => $id,
                "name"   => $name,
                "title"  => $title,
                "description" => $description,
                "route"      => $route,
                "components" => $components,
                "properties" => $properties,
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

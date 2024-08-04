<?php

namespace MerapiPanel\Module\Website {

    use MerapiPanel\Box\Module\__Fragment;
    use MerapiPanel\Box\Module\Entity\Module;

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
            foreach (glob(__DIR__ . "/data/patterns/*.json") as $file) {
                $name = basename($file, ".json");
                $content = json_decode(file_get_contents($file) ?? "{}", 1);
                $data[] = [
                    "name" => $name,
                    ...(is_array($content) ? $content : [$content])
                ];
            }
            return $data;
        }
    }
}

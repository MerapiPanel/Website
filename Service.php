<?php

namespace MerapiPanel\Module\Website;

use MerapiPanel\Box\Module\__Fragment;
use MerapiPanel\Database\DB;
use PDO;

class Service extends __Fragment
{

    protected $module;

    function onCreate(\MerapiPanel\Box\Module\Entity\Module $module)
    {
        $this->module = $module;
    }

    function onInit()
    {

        // $this->module->data->get("page-properties.json")->listenOn("getContent", function (&$data) {
        //     $data[] = "Hallo World";
        // });
        $this->migrateTable();
    }

    private function migrateTable()
    {

        $checkColumnSQL = "
            SELECT COUNT(*) AS count 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE table_name = 'pages' 
            AND table_schema = DATABASE() 
            AND column_name = 'properties';";

        $pdo = DB::instance();
        $stmt = $pdo->query($checkColumnSQL);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result['count'] == 0) {
            $alterTableSQL = "
                ALTER TABLE pages
                ADD COLUMN properties LONGTEXT COLLATE utf8mb4_bin DEFAULT '[]';
            ";
            $pdo->query($alterTableSQL);
        }
    }
}

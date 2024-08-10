<?php

namespace MerapiPanel\Module\Website;

use MerapiPanel\Box\Module\__Fragment;
use MerapiPanel\Box\Module\Entity\Module;
use MerapiPanel\Database\DB;
use PDO;

class Service extends __Fragment
{

    protected $module;

    function onCreate(Module $module)
    {
        $this->module = $module;
    }

    function onInit()
    {

        // custom hook each fragment or module 
        // $this->module->data->Pages->listenOn("renderProperties", function (&$data) {
        //     error_log(print_r($data, 1));
        // });
        $this->migrateTable();
    }

    private function migrateTable()
    {
        // Check if the 'properties' column exists in the 'pages' table
        $checkColumnSQL = "
        SELECT COUNT(*) AS count 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE table_name = 'pages' 
        AND table_schema = DATABASE() 
        AND column_name = 'properties';
    ";

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

        // Check if the 'patterns' table exists
        $checkTableSQL = "
        SELECT COUNT(*) AS count 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE table_name = 'patterns' 
        AND table_schema = DATABASE();";

        $stmt = $pdo->query($checkTableSQL);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result['count'] == 0) {
            $createTableSQL = "
            CREATE TABLE `patterns` (
                `name` CHAR(255) NOT NULL,
                `label` VARCHAR(255) DEFAULT NULL,
                `style` LONGTEXT DEFAULT NULL,
                `components` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]' CHECK (json_valid(`components`)),
                `post_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
                `update_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()
            ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;";
            $pdo->query($createTableSQL);
        }
    }
}

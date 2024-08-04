<?php

namespace MerapiPanel\Module\Website;

use MerapiPanel\Box\Module\__Fragment;

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
    }
}

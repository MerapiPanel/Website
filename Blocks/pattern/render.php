<?php

use MerapiPanel\Box;

$patternName = $attributes['pattern-name'] ?? null;
if (!empty($patternName)) {

    $pattern = Box::module("Website")->Patterns->getpop($patternName);
    echo renderComponents($pattern['components'] ?? []);
} else {

    echo renderComponents($components ?? []);
}

<?php

namespace MerapiPanel\Module\Website\Controller;

use MerapiPanel\Box;
use MerapiPanel\Box\Module\__Fragment;
use MerapiPanel\Utility\Http\Request;
use MerapiPanel\Views\View;
use MerapiPanel\Utility\Router;

class Guest extends __Fragment
{

    protected $module;
    function onCreate(\MerapiPanel\Box\Module\Entity\Module $module)
    {

        $this->module = $module;
    }


    public function register()
    {

        $pages = $this->module->Pages->fetchAll();
        $BlocksEditor = Box::module("Editor")->Blocks;
        $module = $this->module;

        foreach ($pages as $page) {

            $route = $page['route'];
            Router::GET($route, function () use ($page, $BlocksEditor, $module) {

                $components = $page['components'] ?? [];
                $styles     = $page['styles'] ?? "";
                $properties = $this->module->Pages->renderProperties(is_array($page['properties']) ? $page['properties'] : json_decode($page['properties']));
                $content    = $BlocksEditor->render($components);
                self::cleanTwigFragmentFromHtml($content);
                $lang = View::getInstance()->getIntl()->getLocale();
                $styles .= $BlocksEditor->getStyles();

                $global_scripts = $this->renderGlobalAsset("script");
                $global_styles  = $this->renderGlobalAsset("style");
                $global_links   = $this->renderGlobalAsset("link");

                $properties_string = implode(" ", array_filter($properties, fn ($v) => gettype($v) == "string"));

                $html = <<<HTML
                <!DOCTYPE html>
                <html lang="{$lang}">
                    <head>
                        {% block header %}
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        {$properties_string}
                        {% block stylesheet %}
                        <link rel="stylesheet" href="{{ '/dist/main.css' | assets }}">
                        <link rel="stylesheet" href="{{ '/vendor/fontawesome/css/all.min.css' | assets }}">
                        {$global_links}
                        {$global_styles}
                        <style>{$styles}</style>
                        {% endblock %}
                        {% endblock %}
                    </head>
                    <body>
                        {$content}
                        {% block javascript %}
                        <script src="{{ '/vendor/bootstrap/js/bootstrap.bundle.min.js' | assets }}"></script>
                        <script src="{{ '/dist/main.js' | assets }}"></script>
                        {$global_scripts}
                        {% endblock %}
                    </body>
                </html>
                HTML;
                $twig = View::getInstance()->getTwig();
                $template = $twig->createTemplate($html, "template");

                $_variables["_page"] = $page;
                $_variables["_request"] = Request::getInstance();
                $_variables["_lang"] = $lang;
                $output = $template->render($_variables);

                try {
                    $client_ip = Request::getClientIP();
                    $client_ip = $client_ip == '::1' ? '127.0.0.1' : $client_ip;
                    $page_path = Request::getInstance()->getPath();
                    $page_title = $this->getTitleFromHtml($output);
                    $module->Logs->write($client_ip, $page_path, $page_title);
                } catch (\Throwable $t) {
                    // silent
                    error_log($t->getMessage());
                }

                $minimizeOutput = View::minimizeHTML($output);
                foreach ($this->shortCodeFinder($minimizeOutput) as $code) {
                    // call api for render short code
                    $shortcode_render = $this->module->Pages->shortcode($code);
                    if ($shortcode_render && $shortcode_render != $code) {
                        $minimizeOutput = str_replace("[$code]", $shortcode_render, $minimizeOutput);
                    }
                }

                return $this->module->Pages->render($minimizeOutput, $page);
            });
        }
    }


    private $tempGAssets = [];
    private function renderGlobalAsset($type = "link")
    {
        if (empty($this->tempGAssets)) {
            $this->tempGAssets = $this->module->Assets->listpops();
        }

        $filtered = array_filter($this->tempGAssets, fn ($asset) => $asset['type'] == $type);
        $output = "";
        foreach ($filtered as $asset) {
            if ($asset['type'] == $type) {
                $attributes = implode(" ", array_map(fn ($attr) => "$attr[key]=\"$attr[value]\"", $asset["attributes"] ?? []));
                $output .= "<$asset[type]" . (!empty($attributes) ? " " : "") . $attributes . ">" . ($asset['content'] ?? '') . "</$asset[type]>";
            }
        }
        return $output;
    }

    private function shortCodeFinder($html)
    {
        // Define the regex pattern to match the shortcode
        $pattern = '/\[([a-z]{1}[a-z0-9.]*)\]/mi';
        // Find all matches of the pattern in the HTML
        preg_match_all($pattern, $html, $matches);
        // Return the array of shortcodes found
        return $matches[1] ?? [];
    }


    private static function cleanTwigFragmentFromHtml(&$html)
    {
        preg_match_all("/{{.*?}}|{%.*?%}/", $html, $matches);

        foreach ($matches[0] as $match) {
            // Remove any HTML tags from the Twig syntax
            $cleanedMatch = strip_tags($match);
            // Replace the Twig syntax with the cleaned text
            $html = str_replace($match, trim($cleanedMatch), $html);
        }
    }


    private function getTitleFromHtml($htmlString)
    {
        // Match the title tag and its content, allowing for attributes
        preg_match('/<title[^>]*>(.*?)<\/title>/is', $htmlString, $matches);

        // If a match is found, return the content of the title tag
        if (isset($matches[1])) {
            return $matches[1];
        }

        // If no match is found, return null
        return null;
    }
}

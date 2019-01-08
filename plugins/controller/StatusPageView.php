<?php

namespace plugins\controller;

use pukoframework\Framework;
use pukoframework\middleware\View;

/**
 * #Master master.html
 * #Value title Hello World
 */
class StatusPageView extends View
{
    public function Parse()
    {
        if ($this->fn === 'url') {
            return Framework::$factory->getBase() . $this->param;
        }
        if ($this->fn === 'const') {
            return $this->const[$this->param];
        }
        if ($this->fn === 'api') {
            return $this->getAppConstant('API');
        }
        if ($this->fn === 'gateway') {
            return $this->getAppConstant('GATEWAY');
        }
        return '';
    }
}
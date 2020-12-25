<?php

namespace plugins\controller;

use satframework\Framework;
use satframework\middleware\View;

/**
 * #Master master.html
 * #Value title Hello World
 */
class StatusPageView extends View
{

    /**
     * @param null $data
     * @param string $template
     * @param false $templateBinary
     * @return mixed|string|null
     */
    public function Parse($data = null, $template = '', $templateBinary = false)
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

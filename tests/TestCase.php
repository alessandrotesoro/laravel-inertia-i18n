<?php

namespace Sematico\InertiaI18n\Tests;

use Orchestra\Testbench\TestCase as Orchestra;
use Sematico\InertiaI18n\InertiaI18nServiceProvider;

class TestCase extends Orchestra
{
    protected function getPackageProviders($app)
    {
        return [
            InertiaI18nServiceProvider::class,
        ];
    }

    public function getEnvironmentSetUp($app)
    {
        config()->set('app.key', 'base64:'.base64_encode(random_bytes(32)));
        config()->set('app.locale', 'en');
        config()->set('app.fallback_locale', 'en');
    }
}

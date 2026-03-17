<?php

namespace Sematico\InertiaI18n;

use Inertia\Inertia;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class InertiaI18nServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        $package
            ->name('inertia-i18n')
            ->hasConfigFile();
    }

    public function packageBooted(): void
    {
        $this->app->singleton(InertiaI18n::class);

        if (config('inertia-i18n.auto_share', true)) {
            $propName = config('inertia-i18n.prop_name', 'i18n');

            Inertia::share($propName, fn () => app(InertiaI18n::class)->toInertiaPayload());
        }
    }
}

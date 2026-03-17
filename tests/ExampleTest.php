<?php

use Sematico\InertiaI18n\InertiaI18n;

it('can resolve the InertiaI18n singleton', function () {
    $instance = app(InertiaI18n::class);

    expect($instance)->toBeInstanceOf(InertiaI18n::class);
});

it('has the config file', function () {
    expect(config('inertia-i18n'))->toBeArray();
    expect(config('inertia-i18n.auto_share'))->toBeTrue();
    expect(config('inertia-i18n.prop_name'))->toBe('i18n');
    expect(config('inertia-i18n.lang_path'))->toBeNull();
});

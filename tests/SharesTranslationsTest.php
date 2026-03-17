<?php

use Illuminate\Support\Facades\File;
use Sematico\InertiaI18n\SharesTranslations;

beforeEach(function () {
    $this->langPath = sys_get_temp_dir().'/inertia-i18n-test-shares';
    File::ensureDirectoryExists($this->langPath);
    config()->set('inertia-i18n.lang_path', $this->langPath);
});

afterEach(function () {
    File::deleteDirectory($this->langPath);
});

it('trait returns the inertia payload', function () {
    app()->setLocale('de');
    config()->set('app.fallback_locale', 'en');

    File::put(
        $this->langPath.'/de.json',
        json_encode(['Goodbye' => 'Auf Wiedersehen'])
    );

    $instance = new class
    {
        use SharesTranslations;

        public function getProps(): array
        {
            return $this->translationProps();
        }
    };

    $props = $instance->getProps();

    expect($props)->toHaveKeys(['locale', 'fallbackLocale', 'translations']);
    expect($props['locale'])->toBe('de');
    expect($props['fallbackLocale'])->toBe('en');
    expect($props['translations'])->toBe(['Goodbye' => 'Auf Wiedersehen']);
});

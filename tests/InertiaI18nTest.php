<?php

use Illuminate\Support\Facades\File;
use Sematico\InertiaI18n\InertiaI18n;

beforeEach(function () {
    $this->langPath = sys_get_temp_dir().'/inertia-i18n-test-lang';
    File::ensureDirectoryExists($this->langPath);

    config()->set('inertia-i18n.lang_path', $this->langPath);
});

afterEach(function () {
    File::deleteDirectory($this->langPath);
});

it('returns empty array when locale file does not exist', function () {
    $i18n = app(InertiaI18n::class);

    expect($i18n->translations('fr'))->toBe([]);
});

it('loads translations from a json file', function () {
    File::put(
        $this->langPath.'/en.json',
        json_encode(['Welcome!' => 'Welcome!', 'Save' => 'Save'])
    );

    $i18n = app(InertiaI18n::class);
    $translations = $i18n->translations('en');

    expect($translations)->toBe([
        'Welcome!' => 'Welcome!',
        'Save' => 'Save',
    ]);
});

it('loads translations for the current app locale by default', function () {
    app()->setLocale('es');

    File::put(
        $this->langPath.'/es.json',
        json_encode(['Hello' => 'Hola'])
    );

    $i18n = app(InertiaI18n::class);
    $translations = $i18n->translations();

    expect($translations)->toBe(['Hello' => 'Hola']);
});

it('returns empty array for invalid json', function () {
    File::put($this->langPath.'/en.json', 'not valid json{{{');

    $i18n = app(InertiaI18n::class);

    expect($i18n->translations('en'))->toBe([]);
});

it('builds the correct inertia payload', function () {
    app()->setLocale('es');
    config()->set('app.fallback_locale', 'en');

    File::put(
        $this->langPath.'/es.json',
        json_encode(['Hello' => 'Hola'])
    );

    $i18n = app(InertiaI18n::class);
    $payload = $i18n->toInertiaPayload();

    expect($payload)->toBe([
        'locale' => 'es',
        'fallbackLocale' => 'en',
        'translations' => ['Hello' => 'Hola'],
    ]);
});

it('uses configured lang path', function () {
    $customPath = sys_get_temp_dir().'/custom-lang-path';
    File::ensureDirectoryExists($customPath);

    File::put(
        $customPath.'/en.json',
        json_encode(['test' => 'value'])
    );

    config()->set('inertia-i18n.lang_path', $customPath);

    $i18n = app(InertiaI18n::class);

    expect($i18n->langPath())->toBe($customPath);
    expect($i18n->translations('en'))->toBe(['test' => 'value']);

    File::deleteDirectory($customPath);
});

it('accepts a locale override in toInertiaPayload', function () {
    app()->setLocale('en');

    File::put(
        $this->langPath.'/fr.json',
        json_encode(['Hello' => 'Bonjour'])
    );

    $i18n = app(InertiaI18n::class);
    $payload = $i18n->toInertiaPayload('fr');

    expect($payload['locale'])->toBe('fr');
    expect($payload['translations'])->toBe(['Hello' => 'Bonjour']);
});

it('returns empty array for deeply nested json exceeding depth limit', function () {
    // Build JSON nested beyond the depth: 10 limit
    $nested = '"deep"';
    for ($i = 0; $i < 15; $i++) {
        $nested = '{"level'.$i.'":'.$nested.'}';
    }

    File::put($this->langPath.'/en.json', $nested);

    $i18n = app(InertiaI18n::class);

    expect($i18n->translations('en'))->toBe([]);
});

it('merges fallback locale translations for missing keys', function () {
    config()->set('app.fallback_locale', 'en');

    File::put(
        $this->langPath.'/en.json',
        json_encode(['Hello' => 'Hello', 'Save' => 'Save'])
    );

    File::put(
        $this->langPath.'/es.json',
        json_encode(['Hello' => 'Hola'])
    );

    $i18n = app(InertiaI18n::class);
    $translations = $i18n->translations('es');

    // 'Hello' comes from es.json, 'Save' falls back from en.json
    expect($translations)->toBe([
        'Hello' => 'Hola',
        'Save' => 'Save',
    ]);
});

it('current locale translations take precedence over fallback', function () {
    config()->set('app.fallback_locale', 'en');

    File::put(
        $this->langPath.'/en.json',
        json_encode(['Hello' => 'Hello', 'Goodbye' => 'Goodbye'])
    );

    File::put(
        $this->langPath.'/fr.json',
        json_encode(['Hello' => 'Bonjour', 'Goodbye' => 'Au revoir'])
    );

    $i18n = app(InertiaI18n::class);
    $translations = $i18n->translations('fr');

    expect($translations)->toBe([
        'Hello' => 'Bonjour',
        'Goodbye' => 'Au revoir',
    ]);
});

it('does not merge fallback when locale equals fallback locale', function () {
    config()->set('app.fallback_locale', 'en');

    File::put(
        $this->langPath.'/en.json',
        json_encode(['Hello' => 'Hello'])
    );

    $i18n = app(InertiaI18n::class);
    $translations = $i18n->translations('en');

    expect($translations)->toBe(['Hello' => 'Hello']);
});

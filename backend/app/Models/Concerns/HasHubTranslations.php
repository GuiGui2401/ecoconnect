<?php

namespace App\Models\Concerns;

trait HasHubTranslations
{
    /**
     * Return the value of a field in the requested locale, falling back to the
     * base (French) column when no translation exists. Empty translations are
     * treated as missing so the original text is always shown.
     */
    public function translated(string $field, ?string $locale = null): mixed
    {
        $locale = $locale ?: 'fr';

        if ($locale !== 'fr') {
            $value = $this->translations[$locale][$field] ?? null;

            if ($value !== null && $value !== '' && $value !== []) {
                return $value;
            }
        }

        return $this->{$field};
    }
}

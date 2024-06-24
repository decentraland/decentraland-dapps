import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { flatten } from 'flat';

import {
  Locale,
  TranslationState,
  Translation,
  TranslationKeys,
  TranslationFetcherOpts,
} from './types';
import { mergeTranslations, setCurrentLocale } from './utils';
import * as defaultTranslations from './defaults';

const INITIAL_STATE: TranslationState = {
  value: {},
  locale: 'en',
  status: 'idle',
  error: null,
};

export function createTranslationFetcher({
  getTranslation,
  translations,
}: TranslationFetcherOpts) {
  return createAsyncThunk(
    'translation/fetchTranslations',
    async function fetchTranslations(
      locale: Locale,
    ): Promise<{ translations: TranslationKeys; locale: Locale }> {
      let result: Translation;
      if (getTranslation) {
        result = await getTranslation(locale);
      } else if (translations) {
        result = translations[locale];
      } else {
        throw new Error('You must provide `translations` or `getTranslations`');
      }

      // merge translations and defaults
      const allTransalations = mergeTranslations<TranslationKeys>(
        flatten(defaultTranslations[locale]),
        flatten(result),
      );

      setCurrentLocale(locale, allTransalations);

      return { locale, translations: allTransalations };
    },
  );
}

export function createTranslationSlice({
  fetchTranslations,
}: {
  fetchTranslations: ReturnType<typeof createTranslationFetcher>;
}) {
  const { actions, reducer } = createSlice({
    name: 'translation',
    initialState: INITIAL_STATE,
    reducers: {
      changeLocale(state, action: PayloadAction<Locale>) {
        state.locale = action.payload;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchTranslations.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(fetchTranslations.fulfilled, (state, action) => {
          const { locale } = action.payload;
          state.status = 'succeeded';
          state.value[locale] = action.payload.translations;
          state.locale = locale;
        })
        .addCase(fetchTranslations.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message || 'Failed to fetch translations';
        });
    },
  });

  return { reducer, actions: { ...actions, fetchTranslations } };
}

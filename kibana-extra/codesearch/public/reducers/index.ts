/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { combineReducers } from 'redux';

import { editor, EditorState } from './editor';
import { file, FileState } from './file';
import { fullsearch, FullSearchState } from './fullsearch';
import { repository, RepositoryState } from './repository';
import { search, SearchState } from './search';
import { symbol, SymbolState } from './symbol';

export interface RootState {
  repository: RepositoryState;
  search: SearchState;
  fullsearch: FullSearchState;
  file: FileState;
  symbol: SymbolState;
  editor: EditorState;
}

export const rootReducer = combineReducers({
  repository,
  search,
  file,
  symbol,
  editor,
  fullsearch,
});

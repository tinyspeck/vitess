/**
 * Copyright 2021 The Vitess Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { prettyBytes, PrettyBytesOpts } from './formatBytes';

describe('prettyBytes', () => {
    const tests: {
        name: string;
        input: number | Long | string | null | undefined;
        expected: string | null;
        opts?: PrettyBytesOpts | undefined;
    }[] = [
        {
            name: 'handles numeric inputs',
            input: 1024,
            expected: '1 KiB',
        },
        {
            name: 'handles string inputs',
            input: '1024',
            expected: '1 KiB',
        },
        {
            name: 'handles undefined inputs',
            input: undefined,
            expected: null,
        },
        {
            name: 'handles null inputs',
            input: null,
            expected: null,
        },
        {
            name: 'uses default precision',
            input: 1234,
            expected: '1.21 KiB',
        },
        {
            name: 'uses precision parameter if defined',
            input: 1234,
            expected: '1.205 KiB',
            opts: { precision: 3 },
        },
        {
            name: 'uses units parameter if defined',
            input: 1234567890,
            expected: '1,177.38 MiB',
            opts: { units: 'MiB' },
        },
    ];

    test.each(tests.map(Object.values))(
        '%s',
        (
            name: string,
            input: number | Long | null | undefined,
            expected: string | null,
            opts: PrettyBytesOpts = {}
        ) => {
            expect(prettyBytes(input, opts)).toEqual(expected);
        }
    );
});

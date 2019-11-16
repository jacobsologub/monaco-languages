//
//  soul.ts
//
//  Created by Jacob Sologub on 11/15/19.
//  Copyright © 2019 Jacob Sologub All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to 
//  deal in the Software without restriction, including without limitation the 
//  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
//  sell copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in 
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
//  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
//  DEALINGS IN THE SOFTWARE.

'use strict';

import IRichLanguageConfiguration = monaco.languages.LanguageConfiguration;
import ILanguage = monaco.languages.IMonarchLanguage;

export const conf: IRichLanguageConfiguration = {
        comments: {
                lineComment: '//',
                blockComment: ['/*', '*/'],
        },
        brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')']
        ],
        autoClosingPairs: [
                { open: '[', close: ']' },
                { open: '{', close: '}' },
                { open: '(', close: ')' },
                { open: '\'', close: '\'', notIn: ['string', 'comment'] },
                { open: '"', close: '"', notIn: ['string'] },
        ],
        surroundingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: '\'', close: '\'' },
        ],
        folding: {
                markers: {
                        start: new RegExp("^\\s*#pragma\\s+region\\b"),
                        end: new RegExp("^\\s*#pragma\\s+endregion\\b")
                }
        }
};

export const language = <ILanguage>{
    // Set defaultToken to invalid to see what you do not tokenize yet
    defaultToken: 'invalid',
    tokenPostfix: '.soul',

    keywords: [
        'if', 'else',
        'do', 'while', 'for', 'loop',
        'break', 'continue', 'return',
        'const', 'let', 'var',
        'void', 'int', 'int32', 'int64',
        'float', 'float32', 'float64', 'fixed',
        'bool', 'true', 'false', 'string',
        'struct', 'using', 'external',
        'graph', 'processor', 'namespace',
        'connection',
        'event', 'import',
        'try', 'catch', 'throw'
    ],

    endpointKeywords: [
            'input', 'output'
    ],

    wrapClampKeywords: [
        'wrap', 'clamp'
    ],

    brackets: [
        { open: '{', close: '}', token: 'delimiter.curly' },
        { open: '[', close: ']', token: 'delimiter.square' },
        { open: '(', close: ')', token: 'delimiter.parenthesis' },
        { open: '<', close: '>', token: 'delimiter.angle' }
    ],

    operators: [
        '!', '=', '??', '||', '&&', '|', '^', '&', '==', '!=', '<=', '>=', '<<',
        '+', '-', '*', '/', '%', '!', '~', '++', '--', '+=',
        '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '>>', '=>', '::'
    ],

    symbols:  /[\!\.:=><~&|+\-*\/%@#]+/,

    // C# style strings
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    // The main tokenizer for our languages
    tokenizer: {
        root: [

            // identifiers and keywords
            [/\@?[a-zA-Z_]\w*/, {
                cases: {
                    '@wrapClampKeywords': { token: '@rematch', next: '@possibleWrapClampKeyword' },
                    '@endpointKeywords': { token: 'keyword.$0', next: '@endpointDefinition' },
                    '@keywords': { token: 'keyword.$0', next: '@qualified' },
                    '@default': { token: 'identifier', next: '@qualified' }
                }
            }],

            // Highlight the connection operator to make it clearer
            ['->', 'keyword.$0'],

            // whitespace
            { include: '@whitespace' },

            // brackets
            [/[{}()\[\]]/, '@brackets'],

            // operators
            [/@symbols/, {
                cases: {
                    '@operators': 'delimiter',
                    '@default': ''
                }
            }],

                        [/"/, { token: 'string.quote', next: '@string' }],

            // numbers
            [/[0-9_]*\.[0-9_]+([eE][\-+]?\d+)?[fFdD]?/, 'number.float'],
            [/0[xX][0-9a-fA-F_]+/, 'number.hex'],
            [/0[bB][01_]+/, 'number.hex'],
            [/[0-9_]+[fF]/, 'number.float'],
            [/[0-9_]+[lL]?/, 'number'],

            // separators
            [/[;,]/, 'delimiter'],
        ],

        endpointDefinition: [
            ['event', 'keyword.$0', ''],
            ['stream', 'keyword.$0', ''],
            [';', '', '@pop'],
            ['{', '', '@endpointDefinition'],
            [/[a-zA-Z_][\w]*/, {
                cases: {
                    '@keywords': { token: 'keyword.$0' },
                    '@default': 'identifier'
                }
            }],
            [/[{}()\[\]]/, '@brackets'],
            [/,/, 'delimiter'],
            [/@symbols/, {
                cases: {
                    '@operators': 'delimiter',
                    '@default': ''
                }
            }],
            [/[0-9_]+[lL]?/, 'number'],
        ],

        possibleWrapClampKeyword: [
            ['wrap[ ]*\<', '@rematch', '@wrapClampKeyword'],
            ['wrap', '', '@pop'],
            ['clamp[ ]*\<', '@rematch', '@wrapClampKeyword'],
            ['clamp', '', '@pop'],
            ['', '', '@pop'],
        ],

        wrapClampKeyword: [
            ['wrap', 'keyword.$0', '@pop'],
            ['clamp', 'keyword.$0', '@pop'],
        ],

        qualified: [
            [/[a-zA-Z_][\w]*/, {
                cases: {
                    '@keywords': { token: 'keyword.$0' },
                    '@default': 'identifier'
                }
            }],
            [/\./, 'delimiter'],
            ['', '', '@pop'],
        ],

        comment: [
            [/[^\/*]+/, 'comment'],
            // [/\/\*/,    'comment', '@push' ],    // no nested comments :-(
            ['\\*/', 'comment', '@pop'],
            [/[\/*]/, 'comment']
        ],

                string: [
                        [/[^\\"]+/, 'string'],
                        [/@escapes/, 'string.escape'],
                        [/"/, { token: 'string.quote', next: '@pop' }]
                ],

        whitespace: [
            [/^[ \t\v\f]*#((r)|(load))(?=\s)/, 'directive.csx'],
            [/^[ \t\v\f]*#\w.*$/, 'namespace.cpp'],
            [/[ \t\v\f\r\n]+/, ''],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment'],
        ],
    },
};
